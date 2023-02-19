import * as path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {
  entry: {
    background: path.join(__dirname, "src", "background.ts"),
    nhentai: path.join(__dirname, "src", "nhentai.ts"),
  },
  output: {
    filename: path.join(__dirname, "dist", "[name].js"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "tsc",
        exclude: /node_modules/,
      },
    ],
  },
};

export default config;
