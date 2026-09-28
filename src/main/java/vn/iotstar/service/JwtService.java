package vn.iotstar.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        try {
            return SignedJWT.parse(token).getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            throw new IllegalArgumentException("JWT format is invalid", e);
        }
    }

    public String generateToken(UserDetails userDetails) {
        byte[] key = getSecretKeyBytes();
        Date now = new Date();
        Date expiration = new Date(now.getTime() + jwtExpiration);
        List<String> roles = userDetails.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .toList();

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(userDetails.getUsername())
                .issueTime(now)
                .expirationTime(expiration)
                .claim("roles", roles)
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.HS256)
                        .type(JOSEObjectType.JWT)
                        .build(),
                claims
        );

        try {
            signedJWT.sign(new MACSigner(key));
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Cannot sign JWT with Nimbus", e);
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!JWSAlgorithm.HS256.equals(signedJWT.getHeader().getAlgorithm())) {
                return false;
            }
            boolean validSignature = signedJWT.verify(new MACVerifier(getSecretKeyBytes()));
            if (!validSignature) {
                return false;
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            String subject = claims.getSubject();
            Date expiration = claims.getExpirationTime();

            return subject != null
                    && subject.equals(userDetails.getUsername())
                    && expiration != null
                    && expiration.after(new Date());
        } catch (ParseException | JOSEException e) {
            return false;
        }
    }

    public long getExpirationTime() {
        return jwtExpiration;
    }

    private byte[] getSecretKeyBytes() {
        byte[] key = secretKey.getBytes(StandardCharsets.UTF_8);
        if (key.length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 bytes for HS256");
        }
        return key;
    }
}
