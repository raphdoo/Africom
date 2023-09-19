import React, { useEffect, useState, Fragment } from 'react'
import { useAlert } from 'react-alert'
import { useDispatch, useSelector } from 'react-redux'
import MetaData from '../layout/MetaData'
import { useNavigate } from 'react-router-dom'
import { updatePassword, loadUser, clearErrors } from '../../actions/userActions';
import { UPDATE_PASSWORD_RESET} from '../../constants/userConstants';
const UpdatePassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const alert = useAlert();
    const dispatch = useDispatch();
    const Navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { error, isUpdated, loading } = useSelector(state => state.user)

    useEffect(() => {

        if (error) {
            alert.error(error);
            dispatch(clearErrors());
        }
        if (isUpdated) {
            alert.success('Updated Successfully!')
            dispatch(loadUser());
            Navigate('/me')

            dispatch({
                type: UPDATE_PASSWORD_RESET
            })
        }

    }, [dispatch, alert, Navigate, error, isUpdated, user])

    const submitHandler = (e) => {
        e.preventDefault();
        const formdata = new FormData();


        formdata.append('oldPassword', oldPassword);
        formdata.append('newPassword', newPassword);

        dispatch(updatePassword(formdata))

    }
    return (
        <Fragment>
            <MetaData title={'Change Password'} />
            <div className="row wrapper">
                <div className="col-10 col-lg-5">
                    <form className="shadow-lg" onSubmit={submitHandler}>
                        <h1 className="mt-2 mb-5">Update Password</h1>
                        <div className="form-group">
                            <label htmlFor="old_password_field">Old Password</label>
                            <input
                                type="password"
                                id="old_password_field"
                                className="form-control"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="new_password_field">New Password</label>
                            <input
                                type="password"
                                id="new_password_field"
                                className="form-control"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <button type="submit" className="btn update-btn btn-block mt-4 mb-3" disabled={loading ? true : false}>Update Password</button>
                    </form>
                </div>
            </div>
        </Fragment>
    )
}

export default UpdatePassword