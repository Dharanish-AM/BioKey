// eslint-disable-next-line react/prop-types
const Options = ({ modelClose, file, deleteFile }) => {
  return (
    <div className="options-container">
      <ul className="options-ul">
        <li className="options-list">
          <button
            onClick={() => {
              deleteFile(file);
            }}
          >
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Options;
