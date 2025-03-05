import { X } from "lucide-react";
import "./Premium.css";

export default function Premium({ onClose }) {
    const plans = [
        {
            name: "Basic",
            price: "Free",
            features: ["5GB Storage", "Limited Access", "Basic Security"],
        },
        {
            name: "Pro",
            price: "$9.99/mo",
            features: ["100GB Storage", "Advanced Access", "Two-Factor Authentication"],
        },
        {
            name: "Enterprise",
            price: "$15.99/mo",
            features: ["Unlimited Storage", "Priority Support", "End-to-End Encryption"],
        },
    ];

    return (
        <div className="overlay" onClick={onClose}>
            <div className="premium-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="premium-modal-header">
                    <div className="premium-modal-title">Upgrade to Biokey Premium</div>
                    <X color="var(--text-color3)" onClick={onClose} />
                </div>
                <div className="premium-modal-content">
                    <div className="plans-container">
                        {plans.map((plan, index) => (
                            <div key={index} className="plan-card">
                                <div className="plan-title">{plan.name}</div>
                                <div className="plan-price">{plan.price}</div>
                                <ul>
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                                <button className={`subscribe-button ${plan.name == "Basic" ? "basic-plan" : ""} `}>{
                                    plan.name == "Basic" ? "Current Plan" : `Choose ${plan.name}`
                                }</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
