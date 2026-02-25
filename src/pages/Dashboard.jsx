// src/pages/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardStatusTiles from "../components/dashboard/DashboardStatusTiles";
import DashboardNowNext from "../components/dashboard/DashboardNowNext";
import DashboardUpcoming from "../components/dashboard/DashboardUpcoming";
import DashboardRecentCheckins from "../components/dashboard/DashboardRecentCheckins";
import DashboardTrainerWorkload from "../components/dashboard/DashboardTrainerWorkload";

import {
  SOON_WINDOW_MIN,
  RENEWAL_WINDOW_DAYS,
  TRIAL_END_WINDOW_DAYS,
  buildStats,
  buildAlerts,
  getRecentCheckins,
  getUpcomingAppointments,
  getAppointmentsSoon,
  getNowNextAppointment,
  getRenewalsEndingSoon,
  getTrialsEndingSoon,
  buildTrainerWorkload,
  formatNowBadge,
  formatDateRange,
  formatTimeCompact,
  formatShortDate,
  getMemberRenewalDate,
  getMemberTrialEndDate,
  parseCheckinLabel,
} from "../components/dashboard/dashboardHelpers";

import { Panel, Header, Divider, QuickActions, StatCard, MiniMetric } from "../components/dashboard/dashboardUi";

export default function Dashboard({ state }) {
  const navigate = useNavigate();

  const members = state?.members ?? [];
  const checkins = state?.checkins ?? [];
  const appointments = state?.appointments ?? [];
  const cart = state?.cart ?? [];

  // Optional: if you have POS transactions/sales in state
  const transactions = state?.transactions ?? state?.sales ?? [];

  // Optional: trainers/workers in state
  const trainers = state?.trainers ?? state?.workers ?? [];

  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const stats = useMemo(
    () => buildStats({ members, checkins, appointments, cart, transactions }),
    [members, checkins, appointments, cart, transactions]
  );

  const recentCheckins = useMemo(() => getRecentCheckins(checkins, 6), [checkins]);

  const upcomingAppointments = useMemo(
    () => getUpcomingAppointments(appointments, showAllUpcoming ? 10 : 3),
    [appointments, showAllUpcoming]
  );

  const appointmentsSoon = useMemo(
    () => getAppointmentsSoon(appointments, SOON_WINDOW_MIN),
    [appointments]
  );

  const nowNext = useMemo(() => getNowNextAppointment(appointments), [appointments]);

  const renewalsSoon = useMemo(
    () => getRenewalsEndingSoon(members, RENEWAL_WINDOW_DAYS),
    [members]
  );

  const trialsEndingSoon = useMemo(
    () => getTrialsEndingSoon(members, TRIAL_END_WINDOW_DAYS),
    [members]
  );

  const trainerLoad = useMemo(
    () => buildTrainerWorkload({ appointments, trainers }),
    [appointments, trainers]
  );

  const alerts = useMemo(
    () =>
      buildAlerts({
        members,
        appointments,
        renewalsSoonCount: renewalsSoon.length,
        trialsEndingSoonCount: trialsEndingSoon.length,
        onGoMembers: () => navigate("/members"),
        onGoMembersFrozen: () => navigate("/members?status=frozen"),
        onGoMembersInactive: () => navigate("/members?status=inactive"),
        onGoAppointments: () => navigate("/appointments"),
      }),
    [members, appointments, renewalsSoon.length, trialsEndingSoon.length, navigate]
  );

  return (
    <div className="grid" style={{ gap: 16 }}>
      {/* Top: Quick actions + KPIs */}
      <Panel>
        <Header
          title="Dashboard"
          right={
            <div className="muted small" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span>Front Desk</span>
              <span className="badge badge-ok">{formatNowBadge()}</span>
            </div>
          }
        />
        <Divider />

        <QuickActions
          onNewMember={() => navigate("/members/new")}
          onMembers={() => navigate("/members")}
          onCheckin={() => navigate("/checkin")}
          onPOS={() => navigate("/pos")}
          onAppointments={() => navigate("/appointments")}
        />

        <Divider />

        <div className="stats" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
          <StatCard label="Members" value={stats.memberCount} hint={`${stats.memberStatus.active} active`} />
          <StatCard label="Check-ins (today)" value={stats.checkinsToday} hint="Since midnight" />
          <StatCard label="Appts (soon)" value={stats.apptsNext2Hours} hint={`Next ${SOON_WINDOW_MIN} min`} />
          <StatCard label="Revenue (today)" value={`$${stats.revenueToday.toFixed(2)}`} hint="From transactions" />
          <StatCard label="Transactions" value={stats.txToday} hint="Today" />
          <StatCard label="Avg ticket" value={`$${stats.avgTicket.toFixed(2)}`} hint="Today" />
        </div>

        <Divider />

        <div className="row space" style={{ alignItems: "baseline" }}>
          <div>
            <div className="muted">Cart total</div>
            <div className="big">${stats.cartTotal.toFixed(2)}</div>
            <div className="muted small">{stats.cartItems} items in cart</div>
          </div>

          <button className="btn" type="button" onClick={() => navigate("/pos")} disabled={stats.cartItems === 0}>
            Go to POS
          </button>
        </div>
      </Panel>

      {/* Alerts + Overview */}
      <Panel>
        <Header title="Alerts & Overview" right={<span className="muted small">Today</span>} />
        <Divider />

        <DashboardStatusTiles
          memberStatus={stats.memberStatus}
          onActive={() => navigate("/members?status=active")}
          onFrozen={() => navigate("/members?status=frozen")}
          onInactive={() => navigate("/members?status=inactive")}
          onOther={() => navigate("/members")}
        />

        <Divider />

        {alerts.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {alerts.map((a) => (
              <div key={a.key} className="alert-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{a.label}</div>
                    {a.sub ? <div className="muted small">{a.sub}</div> : null}
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span className={`badge ${a.badgeClass || "badge-warn"}`}>{a.value}</span>
                    <button className="btn btn-secondary" type="button" onClick={a.onClick}>
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="muted">No alerts right now.</div>
        )}

        <Divider />

        <div className="row space" style={{ alignItems: "baseline" }}>
          <h3 style={{ margin: 0 }}>Renewals & Trials</h3>
          <button className="btn btn-ghost" type="button" onClick={() => navigate("/members")}>
            Open Members
          </button>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <MiniMetric
            title={`Renewals ending in ${RENEWAL_WINDOW_DAYS} days`}
            value={renewalsSoon.length}
            hint="Members whose membership expires soon"
            onClick={() => navigate("/members")}
          />
          <MiniMetric
            title={`Trials ending in ${TRIAL_END_WINDOW_DAYS} days`}
            value={trialsEndingSoon.length}
            hint="Follow up before they churn"
            onClick={() => navigate("/members")}
          />
        </div>

        {(renewalsSoon.length || trialsEndingSoon.length) ? (
          <div style={{ marginTop: 10 }}>
            {renewalsSoon.length ? (
              <div style={{ marginBottom: 10 }}>
                <div className="muted small" style={{ fontWeight: 900, marginBottom: 6 }}>
                  Renewals ending soon (top 3)
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {renewalsSoon.slice(0, 3).map((m) => (
                    <li key={`renew-${m.member_id}`} className="muted small" style={{ marginBottom: 6 }}>
                      <b>
                        {m.first_name} {m.last_name}
                      </b>{" "}
                      • ends {formatShortDate(getMemberRenewalDate(m))}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {trialsEndingSoon.length ? (
              <div>
                <div className="muted small" style={{ fontWeight: 900, marginBottom: 6 }}>
                  Trials ending soon (top 3)
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {trialsEndingSoon.slice(0, 3).map((m) => (
                    <li key={`trial-${m.member_id}`} className="muted small" style={{ marginBottom: 6 }}>
                      <b>
                        {m.first_name} {m.last_name}
                      </b>{" "}
                      • ends {formatShortDate(getMemberTrialEndDate(m))}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Panel>

      {/* Now / Next */}
      <Panel>
        <Header title="Now / Next Appointment" right={<span className="muted small">Live</span>} />
        <Divider />
        <DashboardNowNext
          nowNext={nowNext}
          appointmentsSoonCount={appointmentsSoon.length}
          onOpenAppointments={() => navigate("/appointments")}
          onCheckin={() => navigate("/checkin")}
          onFindMember={() => navigate("/members")}
          formatDateRange={formatDateRange}
        />
      </Panel>

      {/* Upcoming */}
      <Panel>
        <DashboardUpcoming
          upcomingAppointments={upcomingAppointments}
          showAllUpcoming={showAllUpcoming}
          onToggleShowAll={() => setShowAllUpcoming((v) => !v)}
          onManage={() => navigate("/appointments")}
          formatDateRange={formatDateRange}
        />
      </Panel>

      {/* Recent check-ins */}
      <Panel>
        <DashboardRecentCheckins
          recentCheckins={recentCheckins}
          onOpenCheckin={() => navigate("/checkin")}
          parseCheckinLabel={parseCheckinLabel}
          formatTimeCompact={formatTimeCompact}
        />
      </Panel>

      {/* Trainer workload */}
      <Panel>
        <Header title="Trainer Workload (today)" right={<span className="muted small">Ops</span>} />
        <Divider />
        <DashboardTrainerWorkload trainerLoad={trainerLoad} />
      </Panel>
    </div>
  );
}