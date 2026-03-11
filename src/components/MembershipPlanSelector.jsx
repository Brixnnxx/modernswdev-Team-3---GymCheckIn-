import React, { useState } from "react";

export default function MembershipPlanSelector({ onSelectPlan }) {
  const [selectedPlan, setSelectedPlan] = useState("");

  const handleChange = (event) => {
    const plan = event.target.value;
    setSelectedPlan(plan);

    if (onSelectPlan) {
      onSelectPlan(plan); 
    }
  };

  return (
    <div>
      <h3>Select Membership Plan</h3>

      <select value={selectedPlan} onChange={handleChange}>
        <option value="">Choose a plan</option>
        <option value="basic">Basic - $20/month</option>
        <option value="standard">Standard - $35/month</option>
        <option value="premium">Premium - $50/month</option>
      </select>

      {selectedPlan && <p>Selected Plan: {selectedPlan}</p>}
    </div>
  );
}
