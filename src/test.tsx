import { Grid } from "@raycast/api";
import React, { useEffect, useState } from "react";
import { createGradientUri } from "./lib/colors";

export default function Command() {

  const [gradientOne, setGradientOne] = useState("");
  const [gradientTwo, setGradientTwo] = useState("");

  useEffect(() => {
    createGradientUri(["blue", "orange"], 269, 154).then((data) => setGradientOne(data));
    createGradientUri(["orange"], 269, 153).then((data) => setGradientTwo(data));
  }, []);

  return (
    <Grid aspectRatio="16/9">
      <Grid.Item title={"Gradient Image One"} content={gradientOne} />
      <Grid.Item title={"Gradient Image Two"} content={gradientTwo} />
    </Grid>
  );
}
