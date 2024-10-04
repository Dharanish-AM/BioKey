// eslint-disable-next-line react/prop-types
const Modal = ({ isOpen, onClose, fileUrl, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-header">
        <p>{fileName}</p>
        <button className="close-button" onClick={onClose}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={fileUrl} alt="Enlarged" className="modal-image" />
      </div>
    </div>
  );
};

export default Modal;
