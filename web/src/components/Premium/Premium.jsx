import { X } from "lucide-react";
import "./Premium.css";
import { useSelector } from "react-redux";
import { use } from "react";

export default function Premium({ onClose }) {
  const plans = useSelector((state) => state.appConfig.plans);
  const userPlan = useSelector((state) => state.user.userPlan);

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="premium-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="premium-modal-header">
          <div className="premium-modal-title">Upgrade to Biokey Premium</div>
          <X
            className="close-icon"
            color="var(--text-color3)"
            onClick={onClose}
            style={{
                cursor: "pointer",
            }}
          />
        </div>
        <div className="premium-modal-content">
          <div className="plans-container">
            {plans.map((plan, index) => {
              const isCurrentPlan = userPlan?.id === plan.id;

              return (
                <div
                  key={index}
                  className={`plan-card ${
                    ["Pro", "Enterprise"].includes(plan.name)
                      ? "special-plan"
                      : ""
                  } ${isCurrentPlan ? "current-plan" : ""}`}
                >
                  <div className="plan-title">{plan.name}</div>
                  <div className="plan-price">{plan.price}</div>
                  <ul>
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    className={`subscribe-button ${
                        userPlan == plan._id ? "current-plan-button" : ""
                    }`}
                    disabled={userPlan == plan._id}
                  >
                    {userPlan == plan._id ? "Current Plan" : `Choose ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
