module.exports = {
  "parser": "babel-eslint",
  "extends": ["airbnb", "eslint-config-i-am-meticulous"],
  "rules": {
    "strict": 0,
    // 自定义
    "semi": [1, "always", {"omitLastInOneLineBlock": true}],
    "import/no-extraneous-dependencies": 0,
    "import/no-unresolved": 0,
    "import/order": 1,
    "import/namespace": 0,
    "import/no-namespace": 1,
    "import/default": 0,
    "import/no-named-as-default-member": 0,
    "import/no-deprecated": 0,
    "import/no-named-as-default": 0,
    "quotes": [1, "single", "avoid-escape"],
    "max-len": [1, 180, 4],
    "eqeqeq": 1,
    "space-before-function-paren": [1, {"anonymous": "never", "named": "never"}],
    "camelcase": 1,
    "prefer-const": 1,
    "indent": [1, 2], // 缩进风格
    "arrow-spacing": 1, // 箭头函数的空格
    "comma-spacing": 1, // 冒号前后的空格
    "key-spacing": [1, { "beforeColon": false, "afterColon": true }], // 对象字面量中冒号的前后空格
    "object-curly-spacing": [1, "always"], // 大括号内是否允许不必要的空格
    "no-spaced-func": 2,  // 函数调用时 函数名与()之间不能有空格
    "space-after-keywords": [0, "always"],  // 关键字后面是否要空一格
    "space-in-parens": [1, "never"],  // 小括号里面要不要有空格
    "spaced-comment": 1,  // 注释风格要不要有空格什么的
    "no-undef": 1,
    "import/max-dependencies": 1
  }
};
