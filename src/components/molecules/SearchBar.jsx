import React, { useState, useCallback } from "react";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const SearchBar = ({ 
  onSearch,
  placeholder = "Search...",
  className = "",
  showButton = false,
  debounceMs = 300
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleSearch = useCallback((value) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onSearch?.(value);
    }, debounceMs);

    setDebounceTimer(timer);
  }, [onSearch, debounceMs, debounceTimer]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    onSearch?.(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
      <div className="flex-1">
        <Input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          icon="Search"
          iconPosition="left"
        />
      </div>
      {showButton && (
        <Button type="submit" icon="Search">
          Search
        </Button>
      )}
    </form>
  );
};

export default SearchBar;