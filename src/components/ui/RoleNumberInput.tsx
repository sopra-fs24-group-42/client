import React from "react";
import { NumberInput, NumberInputProps } from "@mantine/core";

const RoleNumberInput: React.FC<NumberInputProps> = (props) => {
  const inputStyles = {
    input: {
      height: "35px",
      paddingLeft: "15px",
      marginLeft: "-4px",
      border: "none",
      borderRadius: "0.75em",
      marginTop: "10px",
      marginBottom: "10px",
      backgroundColor: "rgba(255, 255, 255, 0.65)",
      color: "black",
      width: "320px" //270
    },

    label: {
      color: "black",
      marginBottom: "10px",
      fontWeight: "bold",
      textAlign: "center", //center
      fontSize: "20px",
      fontWeight: "300",
      fontWeight: "bold",
    },

    control: {
      width: "25px",
      height: "25px",
      margin: "2px",
      backgroundColor: "#97ABFF",
      color: "white",
      borderRadius: "30%",
      border: "1px solid #ccc",
    },
  };

  return (
    <NumberInput {...props} styles={inputStyles} />
  );
};

export default RoleNumberInput;