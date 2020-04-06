'use babel';

import BuildProvider from "./build-provider";

module.exports = {
    provideBuilder: function() {
        return BuildProvider;
    }
}
