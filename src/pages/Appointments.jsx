import React from "react";
import "../components/appointments/appointments.css";
import AppointmentsView from "../components/appointments/AppointmentsView";

export default function Appointments(props) {
  // keeps your existing contract: <Appointments state={state} setState={setState} />
  return <AppointmentsView {...props} />;
}
