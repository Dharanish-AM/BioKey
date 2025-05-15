import React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getActivityLogs } from "../../services/userOperations";
import "./ActivityLogs.css";

export default function ActivityLogs() {
  const activityLogs = useSelector((state) => state.user.activityLogs);
  const userId = useSelector((state) => state.user.userId);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  const fetchActivityLogs = async () => {
    await getActivityLogs(userId, token, dispatch);
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(()=>{
    console.log(activityLogs)
  },[activityLogs])

  return (
    <div className="activity-logs-container">
      <div className="app-preferences__title">Activity Logs</div>
      <div className="activity-logs-list">
        {activityLogs.map((log, index) => {
          const date = new Date(log.date || log.timestamp || log.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          const location = log.location
            ? `${log.location.district || 'Unknown'}, ${log.location.region || ''}`
            : 'Unknown, Unknown';

          return (
            <div key={index} className="activity-log-card">
              <div className="activity-log-header">
                <span className="log-date">{date}</span>
                <span className={`log-status ${log.status === 'Success' ? 'success' : 'failed'}`}>
                  {log.status === 'Success' ? 'Login Successful' : 'Login Failed'}
                </span>
              </div>
              <div className="log-device">{log.deviceName || log.userAgent}</div>
              <div className="log-location">{location}</div>
              <div className="log-ip">{log.ipAddress || 'N/A'}</div>
              <div className="log-location-link">
                <a href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`} target="_blank" rel="noreferrer">
                  View Location
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
