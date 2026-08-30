# import json
# import httpx

# SUPABASE_URL = "https://ymkndvybctsehzhlnshj.supabase.co"
# SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlta25kdnliY3RzZWh6aGxuc2hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3Mjk4NTYsImV4cCI6MjEwMzMwNTg1Nn0.DL_wxHofEWwn9RRttbeWydGQ6xfcVOwMVeh6xSK8InI"

# headers = {
#     "apikey": SUPABASE_KEY,
#     "Authorization": f"Bearer {SUPABASE_KEY}",
#     "Content-Type": "application/json",
#     "Prefer": "resolution=merge-duplicates"
# }

# parcels = [
#     {
#         "ulpin": "TN-ERD-125-4A-0001",
#         "survey_no": "125/4A",
#         "sub_division": "125/4A1",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 1.25,
#         "land_use": "Wet Land (நஞ்சை)",
#         "owner_name": "Ramasamy G",
#         "lat": 11.2740,
#         "lng": 77.5870,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-125-4-0099",
#         "survey_no": "125/4",
#         "sub_division": "125/4",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 1.10,
#         "land_use": "Dry Land (புஞ்சை)",
#         "owner_name": "N. Kandasamy",
#         "lat": 11.2752,
#         "lng": 77.5855,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-125-2-0098",
#         "survey_no": "125/2",
#         "sub_division": "125/2",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 0.95,
#         "land_use": "Wet Land (நஞ்சை)",
#         "owner_name": "S. Muthusamy",
#         "lat": 11.2756,
#         "lng": 77.5875,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-124-2-0097",
#         "survey_no": "124/2",
#         "sub_division": "124/2",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 1.45,
#         "land_use": "Dry Land (புஞ்சை)",
#         "owner_name": "V. Palanisamy",
#         "lat": 11.2754,
#         "lng": 77.5898,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-125-5-0002",
#         "survey_no": "125/5",
#         "sub_division": "125/5B",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 0.80,
#         "land_use": "Dry Land (புஞ்சை)",
#         "owner_name": "Murugan P",
#         "lat": 11.2735,
#         "lng": 77.5850,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-126-1-0003",
#         "survey_no": "126/1",
#         "sub_division": "126/1A",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 2.05,
#         "land_use": "Dry Land (புஞ்சை)",
#         "owner_name": "Lakshmi Ammal",
#         "lat": 11.2738,
#         "lng": 77.5892,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-126-3-0004",
#         "survey_no": "126/3",
#         "sub_division": "126/3A",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 0.60,
#         "land_use": "Garden Land (தோட்டம்)",
#         "owner_name": "K. Palanisamy",
#         "lat": 11.2727,
#         "lng": 77.5868,
#         "status": "Active"
#     },
#     {
#         "ulpin": "TN-ERD-127-1-0096",
#         "survey_no": "127/1",
#         "sub_division": "127/1",
#         "district_name": "Erode",
#         "taluk_name": "Perundurai",
#         "village_name": "Ayigoundanpalayam",
#         "area_acres": 1.75,
#         "land_use": "Dry Land (புஞ்சை)",
#         "owner_name": "M. Chinnasamy",
#         "lat": 11.2720,
#         "lng": 77.5860,
#         "status": "Active"
#     }
# ]

# with httpx.Client() as client:
#     r = client.post(f"{SUPABASE_URL}/rest/v1/parcels", headers=headers, json=parcels)
#     print("Seed status:", r.status_code, r.text)
