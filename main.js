'use babel';

import {PlatformIOBuildProvider} from './build-provider';

module.exports = {
    provideBuilder: function() {
        return PlatformIOBuildProvider;
    }
}
