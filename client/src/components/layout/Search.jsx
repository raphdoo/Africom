import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {

    const [keyword, setKeyword] = useState("");
    const Navigate = useNavigate();

    const searchHandler = (event) =>{
        event.preventDefault();

        if(keyword.trim()) {
            Navigate(`/search/${keyword}`)
        }else{
            Navigate(`/`)
        }

    }

  return (
    <div>
      <form onSubmit={searchHandler}>
        <div>
          <div className="input-group">
            <input
              type="text"
              id="search_field"
              className="form-control"
              placeholder="Enter Product Name ..."
              onChange={(event)=> setKeyword(event.target.value)}
            />
            <div className="input-group-append">
              <button id="search_btn" className="btn">
                <i className="fa fa-search" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Search
