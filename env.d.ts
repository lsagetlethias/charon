// Auto-generated with "generateEnvDeclaration" script
/* eslint-disable */
declare namespace NodeJS {
    interface ProcessEnv {
        /**
         * Dist: `secret`  
         * {@link [Local Env Dist](.env.dist)}
         */
        CHARON_COOKIE_SECRET?: string;
        /**
         * Dist: `http://localhost:4500`  
         * {@link [Local Env Dist](.env.dist)}
         */
        CHARON_PUBLIC_HOST?: string;
        /**
         * Dist: `4500`  
         * {@link [Local Env Dist](.env.dist)}
         */
        CHARON_PORT?: string;
        /**
         * Dist: `/healthz`  
         * {@link [Local Env Dist](.env.dist)}
         */
        CHARON_HEALTHCHECK_PATH?: string;
        /**
         * Dist: `false`  
         * {@link [Local Env Dist](.env.dist)}
         */
        CHARON_HEALTHCHECK_SIMPLE?: string;
        /**
         * No dist value.  
         * {@link [Local Env Dist](.env.dist)}
         */
        CHARON_VERSION?: string;
    }
}
declare type ProcessEnvCustomKeys = 
    | 'CHARON_COOKIE_SECRET'
    | 'CHARON_PUBLIC_HOST'
    | 'CHARON_PORT'
    | 'CHARON_HEALTHCHECK_PATH'
    | 'CHARON_HEALTHCHECK_SIMPLE'
    | 'CHARON_VERSION';