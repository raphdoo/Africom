import {useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';
import Home from './components/Home';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import ProductDetails from './components/product/ProductDetails';
import { useSelector } from 'react-redux';

import Login from './components/user/Login';
import Register from './components/user/Register';
import Profile from './components/user/Profile';
import ProtectedRoute from './components/route/ProtectedRoute';

import {loadUser} from './actions/userActions';
import store from './store';


import UpdateProfile from './components/user/updateProfile';
import UpdatePassword from './components/user/updatePassword';
import ForgotPassword from './components/user/ForgotPassword';
import ResetPassword from './components/user/ResetPassword';
import ConfirmOrder from './components/cart/confirmOrder';

//Admin imports
import Dashboard from './components/admin/Dashboard';

import ShippingInfo from './components/cart/ShippingInfo';
import Payment from './components/cart/Payment';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';


import Cart from './components/cart/Cart';
import OrderSuccess from './components/cart/OrderSuccess';
import ListOrders from './components/order/ListOrders';
import OrderDetails from './components/order/OrderDetails';
import ProductsList from './components/admin/ProductsList';
import NewProduct from './components/admin/NewProduct';
import UpdateProduct from './components/admin/UpdateProduct';
import OrdersList from './components/admin/OrdersList';
import ProcessOrder from './components/admin/ProcessOrder';
import UsersList from './components/admin/UsersList';
import UpdateUser from './components/admin/UpdateUser';
import ProductReviews from './components/admin/ProductReviews';




function App() {
  const [stripeApiKey, setStripeApiKey] = useState('');
  const { loading, isAuthenticated, user } = useSelector(state => state.auth)

  useEffect(()=>{
    store.dispatch(loadUser())

    async function getStripApiKey() {
      const { data } = await axios.get('/api/v1/stripeapi');


      setStripeApiKey(data.stripeApiKey)
    }

    getStripApiKey();
  }, [])

  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container container-fluid">
          <Routes> 
          <Route path="/" element={<Home />} exact/>
          <Route path="/search/:keyword" element={<Home />}/>            
          <Route path="/product/:id" element={<ProductDetails />} exact/>

          <Route path="/cart" element={<Cart />} exact/>
          <Route path="/shipping"  element={<ProtectedRoute ><ShippingInfo /></ProtectedRoute>}/>
          <Route path="/order/confirm"  element={<ProtectedRoute ><ConfirmOrder /></ProtectedRoute>}/>
          <Route path = "/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          {
          stripeApiKey && <Route path = '/payment' element={<Elements stripe={loadStripe(stripeApiKey)} ><ProtectedRoute><Payment /></ProtectedRoute></Elements>}  />
          }

          <Route path = "/orders/me" element={<ProtectedRoute><ListOrders /></ProtectedRoute>} />
          <Route path = "/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} exact/>



          
          <Route path="/login"  element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/password/update"  element={<ProtectedRoute ><UpdatePassword /></ProtectedRoute>}/>
          <Route path="/password/forgot"  element={<ForgotPassword />} exact/>
          <Route path="/password/reset/:token"  element={<ResetPassword />}/>


          <Route path="/me"  element={<ProtectedRoute ><Profile /></ProtectedRoute>} exact/>
          <Route path="/me/update"  element={<ProtectedRoute ><UpdateProfile /></ProtectedRoute>} exact/>



                                      
                                                
          </Routes>
        </div>
          <Routes>
            <Route path="/dashboard"   element={<ProtectedRoute isAdmin={true} ><Dashboard /></ProtectedRoute>}/>
            <Route path="/admin/products"   element={<ProtectedRoute isAdmin={true} ><ProductsList /></ProtectedRoute>}/>
            <Route path="/admin/product"   element={<ProtectedRoute isAdmin={true} ><NewProduct /></ProtectedRoute>} exact/>
            <Route path="/admin/product/:id"   element={<ProtectedRoute isAdmin={true} ><UpdateProduct /></ProtectedRoute>} exact/>
            <Route path="/admin/orders"   element={<ProtectedRoute isAdmin={true} ><OrdersList /></ProtectedRoute>} exact/>
            <Route path="/admin/order/:id"   element={<ProtectedRoute isAdmin={true} ><ProcessOrder /></ProtectedRoute>} exact/>
            <Route path="/admin/users"   element={<ProtectedRoute isAdmin={true} ><UsersList /></ProtectedRoute>} exact/>
            <Route path="/admin/user/:id"   element={<ProtectedRoute isAdmin={true} ><UpdateUser /></ProtectedRoute>} exact/>
            <Route path="/admin/reviews"   element={<ProtectedRoute isAdmin={true} ><ProductReviews /></ProtectedRoute>} exact/>






          </Routes>
        {
          !loading && (
           !isAuthenticated || user.role !== 'admin') && (
            <Footer />
          )
        }
      </div>
    </Router>
  );
}

export default App;
