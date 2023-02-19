import * as path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {
  mode: "development",
  entry: {
    background: path.join(__dirname, "src", "background.ts"),
    nhentai: path.join(__dirname, "src", "nhentai.ts"),
  },
  output: {
    path: path.join(__dirname, "dist", "src"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  devtool: "inline-source-map",
};

export default config;
