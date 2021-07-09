module.exports = {
  publicPath: "./",
  chainWebpack: (config) => {
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        options.templateCompilers = {
          vugel: require("vugel"),
        };
        options.compilerOptions = {
          isCustomElement: (tag) =>
            [
              "container",
              "text",
              "styled-rectangle",
              "rectangle",
              "drawing",
            ].includes(tag),
        };
        return options;
      });
  },
};
