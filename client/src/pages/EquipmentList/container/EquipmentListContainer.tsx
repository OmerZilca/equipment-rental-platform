import React, { useEffect, useState } from "react";
import EquipmentGrid from "../components/EquipmentGrid";
import type { Equipment } from "../../../types";
import { getEquipmentList } from "../../../services/api";

const EquipmentListContainer: React.FC = () => { //creat Container Component
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]); //The stats of equipmentList
  const [loading, setLoading] = useState(true); //loading state
  const [error, setError] = useState("");

  useEffect(() => { 
    const fetchEquipment = async () => { // the func wich bring the data from the server
      try {
        const data = await getEquipmentList(); //API call
        setEquipmentList(data.items);
      } catch (err) {
        console.error(err);
        setError("Failed to load equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading equipment...</div>;
  }

  if (error) {
    return <div style={{ padding: "24px" }}>{error}</div>;
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <h1 style={{ marginBottom: "32px" }}>Available Equipment</h1>
      <EquipmentGrid equipmentList={equipmentList} />
    </div>
  );
};

export default EquipmentListContainer;