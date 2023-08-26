export interface WellKnown {
  acr_values_supported: string[]; // ["eidas1"];
  authorization_endpoint: string;
  authorization_response_iss_parameter_supported: boolean;
  claim_types_supported: string[]; // ["normal"];
  claims_parameter_supported: boolean;
  claims_supported: string[];
  code_challenge_methods_supported: string[]; // ["S256"];
  end_session_endpoint: string;
  grant_types_supported: string[]; // ["authorization_code"];
  id_token_encryption_alg_values_supported: string[]; // ["A128KW", "A256KW", "ECDH-ES", "RSA-OAEP", "dir"];
  id_token_encryption_enc_values_supported: string[]; // ["A128CBC-HS256", "A128GCM", "A256CBC-HS512", "A256GCM"];
  id_token_signing_alg_values_supported: string[]; // ["ES256", "EdDSA", "PS256", "RS256"];
  introspection_endpoint: string;
  introspection_endpoint_auth_methods_supported: string[]; // [
  //   "client_secret_basic",
  //   "client_secret_jwt",
  //   "client_secret_post",
  //   "private_key_jwt",
  //   "none",
  // ];
  introspection_endpoint_auth_signing_alg_values_supported: string[]; //  ["HS256", "RS256", "PS256", "ES256", "EdDSA"];
  issuer: string;
  jwks_uri: string;
  request_object_encryption_alg_values_supported: string[]; // ["A128KW", "A256KW", "dir", "ECDH-ES", "RSA-OAEP"];
  request_object_encryption_enc_values_supported: string[]; // ["A128CBC-HS256", "A128GCM", "A256CBC-HS512", "A256GCM"];
  request_object_signing_alg_values_supported: string[]; // ["HS256", "RS256", "PS256", "ES256", "EdDSA"];
  request_parameter_supported: boolean;
  request_uri_parameter_supported: boolean;
  require_request_uri_registration: boolean;
  response_modes_supported: string[]; // ["form_post", "fragment", "query"];
  response_types_supported: string[]; // ["code"];
  scopes_supported: string[]; // [
  //   "openid",
  //   "email",
  //   "profile",
  //   "organization",
  //   "organizations",
  //   "uid",
  //   "given_name",
  //   "usual_name",
  //   "siret",
  //   "is_service_public",
  //   "phone",
  // ];
  subject_types_supported: string[]; // ["public"];
  token_endpoint: string;
  token_endpoint_auth_methods_supported: string[]; //  [
  //   "client_secret_basic",
  //   "client_secret_jwt",
  //   "client_secret_post",
  //   "private_key_jwt",
  //   "none",
  // ];
  token_endpoint_auth_signing_alg_values_supported: string[]; // ["HS256", "RS256", "PS256", "ES256", "EdDSA"];
  userinfo_encryption_alg_values_supported: string[]; // ["A128KW", "A256KW", "ECDH-ES", "RSA-OAEP", "dir"];
  userinfo_encryption_enc_values_supported: string[]; // ["A128CBC-HS256", "A128GCM", "A256CBC-HS512", "A256GCM"];
  userinfo_endpoint: string;
  userinfo_signing_alg_values_supported: string[]; // ["ES256", "EdDSA", "PS256", "RS256"];
}
