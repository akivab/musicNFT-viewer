import React from "react";

export let UserInfo = (props) => {
    return <div>User Name: {props.userName || 'what'}</div>
};