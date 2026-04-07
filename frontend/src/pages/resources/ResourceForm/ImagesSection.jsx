export default function ImagesSection({ formData, setFormValue }) {
  const imageUrls = formData.imageUrls || [];

  const handleUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setFormValue('imageUrls', newUrls);
  };

  const addUrlRow = () => {
    if (imageUrls.length < 5) {
      setFormValue('imageUrls', [...imageUrls, '']);
    }
  };

  const removeUrlRow = (index) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setFormValue('imageUrls', newUrls);
  };

  return (
    <div className="form-section">
      <h3>Images</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '15px' }}>
        Add up to 5 image URLs to showcase this resource.
      </p>

      {imageUrls.map((url, index) => (
        <div key={index} className="image-url-row">
          <input
            type="url"
            className="form-input"
            placeholder={`Image URL ${index + 1}`}
            value={url}
            onChange={(e) => handleUrlChange(index, e.target.value)}
          />
          <button 
            type="button" 
            className="btn-remove-row"
            onClick={() => removeUrlRow(index)}
            title="Remove Image URL"
          >
            &times;
          </button>
        </div>
      ))}

      {imageUrls.length < 5 && (
        <button 
          type="button" 
          className="btn-add-row"
          onClick={addUrlRow}
        >
          + Add Image URL {imageUrls.length === 0 ? '(First Image)' : ''}
        </button>
      )}
    </div>
  );
}
