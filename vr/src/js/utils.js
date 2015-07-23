KISSY.add("vr/utils", function(S){
    var utils = {
        getUrlKey: function(key) {
            if (!key) {
                return S.unparam(location.search.substring(1));
            }
            return S.unparam(location.search.substring(1))[key];
        },
        renderTPL:function(tpl, data){
            var str = tpl;
            data = data||{};
            for (var key in data){
                var reg = new RegExp("{{" + key + "}}", "g");
                str = str.replace(reg, data[key]);
            }
            return str;
        }
    };

    return utils;
});