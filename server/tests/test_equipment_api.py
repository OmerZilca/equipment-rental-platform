def test_equipment_list_returns_items(client):
    r = client.get("/api/equipment")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0
    first = data["items"][0]
    assert "storeId" in first
    assert "storeName" in first


def test_equipment_detail_unknown_id_404(client):
    r = client.get("/api/equipment/999999")
    assert r.status_code == 404
