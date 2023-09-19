import React, { Fragment, useEffect, useState } from "react";

import MetaData from "./layout/MetaData";
import Loader from "./layout/Loader";

import { useSelector, useDispatch } from "react-redux";
import { getProducts } from "../actions/productActions";
import Product from './product/Product';
import Pagination from "react-js-pagination";

import {useAlert} from 'react-alert';

import { useParams } from 'react-router-dom';


import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
const { createSliderWithTooltip } = Slider;
const Range = createSliderWithTooltip(Slider.Range)


const Home = () => {

    const [currentPage, setCurrentPage] = useState(1);
    const [price, setPrice] = useState([1, 1000]);
    const [category, setCategory] = useState('');
    const [ratings, setRatings] = useState(0)

    const categories = [
        'Electronics',
        'Cameras',
        'Laptops',
        'Accessories',
        'Headphones',
        'Food',
        "Books",
        'Clothes/Shoes',
        'Beauty/Health',
        'Sports',
        'Outdoor',
        'Home'
    ]

    const alert = useAlert()
    const dispatch = useDispatch();
    const params = useParams();

    const { loading, products, error, productsCount, resultPerPage, filteredProductsCount } = useSelector(state =>state.products);

    const keyword = params.keyword


    useEffect(() =>{
        if(error){
            return alert.error(error)
        }
        dispatch(getProducts(keyword, currentPage, price, category, ratings))


    }, [dispatch, alert, error, currentPage, keyword, price, category, ratings])


    function setCurrentPageNumber(pageNumber){
      setCurrentPage(pageNumber)
    }

    let count = productsCount;
    if(keyword){
      count = filteredProductsCount
    }

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <MetaData title={`Buy Best Products Online`} />
          <h1 id="products_heading">Latest Products</h1>

          <section id="products" className="container mt-5">
            <div className="row">
              
              {
                keyword ? (
                  <Fragment>
                    <div className="col-6 col-md-3 mt-5 mb-5">
                      <div className="px-5">
                        <Range 
                          marks= {{
                            1: '$1',
                            1000: '$1000'
                          }}
                          min={1}
                          max={1000}
                          defaultValue={[1, 1000]}
                          tipFormatter={value => `$${value}`}
                          tipProps={{
                            placement: 'top',
                            visible: true
                          }}
                          value = {price}
                          onChange={price => setPrice(price)}
                        />

                        <hr className="my-5"/>
                        <h4 className="mb-5">Categories</h4>
                        <ul className="pl-0">
                          {
                            categories.map((category, index) =>(
                                <li key={index} style={{cursor: "pointer", listStyle:"none"}} onClick={ ()=>setCategory(category)} >
                                  {category}
                                </li>
                            ))
                          }

                        </ul>

                        <hr className="my-3"/>
                        <h4 className="mb-3">Rating</h4>
                        <ul className="pl-0">
                          {
                            [5,4,3,2,1].map((star, index) =>(
                                <li key={index} style={{cursor: "pointer", listStyle:"none"}} onClick={ ()=>setRatings(star)} >
                                  <div className="rating-outer">
                                    <div className="rating-inner" style={{width: `${star * 20}%`}}>

                                    </div>
                                  </div>
                                </li>
                            ))
                          }

                        </ul>
                      </div>
                      
                    </div>

                    <div className="col-6 col-md-9">
                      <div className="row">
                          {
                            products.map((product) => {
                              return <Product product={product} col={4}/>;
                            })
                          }
                      </div>

                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    {products &&
                    products.map((product) => {
                      return <Product key={product._id} product={product} col={3}/>;
                    })}
                  </Fragment>
                )
              } 

              
            </div>
          </section>

          {
            (resultPerPage <= count) &&
            (<div className="d-flex justify-content-center mt-5">
            <Pagination 
            activePage={currentPage} 
            itemsCountPerPage={resultPerPage} 
            totalItemsCount={productsCount} 
            onChange={setCurrentPageNumber} 
            nextPageText={'Next'}
            prevPageText={'Prev'}
            firstPageText={'First'}
            lastPageText={'last'}
            itemClass="page-item"
            linkClass="page-link"
            />
      </div>)
          }
        </Fragment>
      )}
    </Fragment>
  );
};

export default Home;
