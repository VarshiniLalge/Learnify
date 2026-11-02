const path = require("path");
const HtmlWebpackPlugin=require("html-webpack-plugin");

module.exports={
    entry:"./src/index.js",

    output:{
        path:path.resolve(__dirname,"dist"),
        filename:"bundle.js",
        clean:true,
    },
    mode:"development",
    devServer:{
        static:path.join(__dirname,"public"),
        port:3000,
        open:true,
        hot:true,
        historyApiFallback: true,
    },
    module:{
        rules:[
            {
            test: /\.(js|jsx)$/,
            exclude:/node_modules/,
            use:"babel-loader",
            },
            {
                test:/\.css$/,
                use:["style-loader","css-loader"],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type:"asset/resource",
            },
        ],
    },

    resolve:{
        extensions:[".js",".jsx"]
    },

    plugins:[
        new HtmlWebpackPlugin({
            template:"./public/index.html",
        }),
    ],
};