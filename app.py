from flask import Flask, request, jsonify
import pandas as pd
import joblib

# Load the trained models and datasets
model = joblib.load('./pickle/linear_regression_model.pkl')
efficiency_model = joblib.load('./pickle/efficiency_model.pkl')
price_model = joblib.load('./pickle/price_model.pkl')
size_model = joblib.load('./pickle/size_model.pkl')
solar_data = pd.read_excel('./Synthetic_Env_SolarData_Optimized.xlsx')
substation_data = pd.read_excel('./Sub_Station_data.xlsx')

# Preprocess the solar data
solar_data[['Min Power (Wp)', 'Max Power (Wp)']] = solar_data['Series Power Range (Wp)'] \
    .str.split('~', expand=True).astype(float)
solar_data['Min Power (W)'] = solar_data['Min Power (Wp)'] * 1000
solar_data['Max Power (W)'] = solar_data['Max Power (Wp)'] * 1000
solar_data['Panel Size'] = (solar_data['Height (mm)'] * solar_data['Width (mm)']) / 1_000_000

# Preprocess the substation data
substation_data['Allowed Capacity (W)'] = substation_data['Allowed Capacity'] * 1000
substation_data['Name of the Substation'] = substation_data['Name of the Substation'].str.strip().str.lower()
 
# Initialize Flask app
app = Flask(__name__)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()

    # Extract user inputs
    location = data.get('location')
    land_size = data.get('land_size')

    # Validate inputs
    if not location or not land_size:
        return jsonify({"error": "Location and land_size are required"}), 400

    # Normalize the input location
    location = location.strip().lower()

    print(f"Normalized Input Location: {location}")
    print(f"Available Locations: {substation_data['Name of the Substation'].tolist()}")

    # Find the allowed capacity for the given location
    substation_row = substation_data[substation_data['Name of the Substation'] == location]
    if substation_row.empty:
        return jsonify({"error": f"Location '{location}' not found in the substation data."}), 400

    allowed_capacity = substation_row['Allowed Capacity (W)'].values[0]
    print(f"Allowed Capacity for {location}: {allowed_capacity} W")

    # Filter solar panels based on allowed capacity with tolerance
    tolerance = 0.1  # 10% tolerance
    matching_panels = solar_data[
        (solar_data['Min Power (W)'] <= allowed_capacity * (1 + tolerance)) &
        (solar_data['Max Power (W)'] >= allowed_capacity * (1 - tolerance))
    ]
    print(f"Matching Panels Count: {len(matching_panels)}")

    # Fallback to closest panels if no exact match found
    if matching_panels.empty:
        solar_data['Difference'] = abs(solar_data['Max Power (W)'] - allowed_capacity)
        matching_panels = solar_data.nsmallest(5, 'Difference')
        print(f"No exact matches found. Returning closest panels: {matching_panels[['Min Power (W)', 'Max Power (W)']]}")

    # Prepare input for efficiency_model
    avg_panel_size = matching_panels['Panel Size'].mean()
    efficiency_features = pd.DataFrame([{
        'Min Power (W)': allowed_capacity * 0.8,
        'Max Power (W)': allowed_capacity * 1.2,
        'Panel Size': avg_panel_size
    }])
    print(f"Efficiency Model Features: {efficiency_features}")

    # Predict average efficiency
    try:
        avg_efficiency = efficiency_model.predict(efficiency_features)[0]
    except Exception as e:
        print(f"Error in Efficiency Prediction: {e}")
        avg_efficiency = matching_panels['Panel Efficiency (%) At STC'].mean()

    # Predict average price
    try:
        avg_price = price_model.predict([[allowed_capacity]])[0]
    except Exception as e:
        print(f"Error in Price Prediction: {e}")
        avg_price = matching_panels['Price'].mean()

    # Predict average panel size
    size_features = pd.DataFrame([{
        'Min Power (W)': allowed_capacity * 0.8,
        'Max Power (W)': allowed_capacity * 1.2,
        'Panel Efficiency (%) At STC': avg_efficiency
    }])
    print(f"Size Model Features: {size_features}")

    try:
        avg_panel_size = size_model.predict(size_features)[0]
    except Exception as e:
        print(f"Error in Size Prediction: {e}")
        avg_panel_size = matching_panels['Panel Size'].mean()

    # Prepare input data for the main model
    input_data = pd.DataFrame([{
        'Min Power (W)': allowed_capacity * 0.8,
        'Max Power (W)': allowed_capacity * 1.2,
        'Allowed Capacity (W)': allowed_capacity,
        'Panel Efficiency (%) At STC': avg_efficiency,
        'Price': avg_price
    }])
    print(f"Main Model Input Data: {input_data}")

    try:
        predicted_panels = model.predict(input_data)[0]
    except Exception as e:
        return jsonify({"error": "Prediction failed in main model", "details": str(e)}), 500

    # Calculate panels that can fit in the provided land size
    panels_fit_in_land = int(land_size / avg_panel_size)
    print(f"Panels Fit in Land: {panels_fit_in_land}")

    # Return the results
    return jsonify({
        "location": location,
        "land_size": int(land_size),
        "allowed_capacity": int(allowed_capacity / 1000),  # Convert to kW
        "avg_efficiency": float(avg_efficiency),
        "avg_price": round(float(avg_price), 2),
        "predicted_panels": int(predicted_panels),
        "panels_fit_in_land": int(panels_fit_in_land),
        "final_price": round(float(avg_price * panels_fit_in_land), 2)
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)