import { Search } from 'lucide-react';
import './Catalogue.css';

export default function SearchBar({ searchParams, updateParams }) {
  const handleChange = (e) => {
    updateParams('name', e.target.value);
  };

  return (
    <div className="search-bar-container">
      <Search className="search-icon" size={22} />
      <input
        type="text"
        className="search-input"
        placeholder="Search by name..."
        value={searchParams.name || ''}
        onChange={handleChange}
      />
    </div>
  );
}
