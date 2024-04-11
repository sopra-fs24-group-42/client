import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/Button.scss";

export const Button = props => (
  <button
    {...props}
    style={{width: props.width, height: props.height, ...props.style}}
    className={`primary-button ${props.className}`}>
    {props.children}
  </button>
);

Button.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};
