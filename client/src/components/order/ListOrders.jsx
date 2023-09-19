import React, { Fragment, useEffect } from 'react';
import { MDBDataTable } from 'mdbreact';
import Loader from '../layout/Loader';
import { Link } from 'react-router-dom';
import MetaData from '../layout/MetaData';
import { useDispatch, useSelector } from 'react-redux';
import { myOrders, clearErrors } from '../../actions/orderActions';
import { useAlert } from 'react-alert';


const ListOrders = () => {

    const alert = useAlert();
    const dispatch = useDispatch();
    const { loading, orders, error } = useSelector(state => state.myOrders);
    useEffect(() => {
        dispatch(myOrders());

        if (error) {
            alert.error(error);
            dispatch(clearErrors());
        }
    }, [dispatch, error, alert])

    const setOrders = () => {
        const data = { 
            columns: [{
                label: 'Order ID',
                field: 'id',
                sort: 'asc'
            },
            {
                label: 'Number of Items',
                field: 'numOfItems',
                sort: 'asc'
            },
            {
                label: 'Amount',
                field: 'amount',
                sort: 'asc'
            },
            {
                label: 'Status',
                field: 'status',
                sort: 'asc'
            },
            {
                label: 'Actions',
                field: 'actions',
                sort: 'asc'
            }
        
        ],
        rows: []
        }

        orders.forEach( order => {
            data.rows.push({
                id: order._id,
                numOfItems: order.orderItems.length,
                amount: ` ${order.totalPrice}`,
                status: order.orderStatus && String(order.orderStatus).includes('Delivered') 
                ? <p style={{color: 'green'}}>{order.orderStatus}</p>
                : <p style={{color: 'red'}}>{order.orderStatus}</p>,
                actions:
                    <Link to={`/order/${order._id}`} className="btn btn-primary">
                        <i className="fa fa-eye"></i>
                    </Link>
            })
        })
        return data;
    }
    return (<Fragment>
        <MetaData title={'My Orders'} />
        <h1 className="my-5">My Orders</h1>
        {loading? <Loader /> : (
            <MDBDataTable
            data={setOrders()}
            className='px-3'
            bordered
            striped
            hover
            />
        )}
    </Fragment>);
};

export default ListOrders;