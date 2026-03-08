import React from "react";
import EquipmentCard from "./EquipmentCard";
import type { Equipment } from "../../../types";

type Props = {
  equipmentList: Equipment[];
};

const EquipmentGrid: React.FC<Props> = ({ equipmentList }) => {
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      {equipmentList.map((item) => (
        <EquipmentCard key={item.id} equipment={item} />
      ))}
    </div>
  );
};

export default EquipmentGrid;