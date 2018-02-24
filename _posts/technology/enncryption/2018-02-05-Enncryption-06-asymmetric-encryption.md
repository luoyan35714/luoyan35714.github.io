---
layout: post
title:  加密算法学习笔记(六) - 非对称加密算法
date:   2018-02-05 09:20:00 +0800
categories: 技术文档
tag: 加密算法
---

* content
{:toc}


非对称加密算法
=================================

公钥和私钥，在非对称加密算法中，有的算法支持公钥加密私钥解密，有的算法支持私钥加密公钥解密，有的这两种算法都支持。

+ DH(Diffie-Hellman) - 密钥交换算法
+ RSA - 基于因子分解
+ ElGamal - 基于离散对数
+ ECC(Elliptical Curve Cryptography) - 椭圆曲线加密


DH(Diffie-Hellman) - 密钥交换算法
=================================

| 密钥长度 			| 默认 	| 工作方式 	| 填充方式 	| 实现方	|
| 512-1024(64倍数)	| 1024 	| 无			| 无			| JDK 	|


初始化发送方密钥
---------------------------------

- KeyPairGenerator
- KeyPair
- PublicKey

初始化接收方密钥
---------------------------------

- KeyFactory
- X509EncodedKeySpec
- DHPublicKey
- DHParameterSpec
- KeyPairGenerator
- PrivateKey

密钥构建
---------------------------------

- KeyAgreement
- SecretKey
- KeyFactory
- X509EncodedKeySpec
- PublicKey

加密，解密
---------------------------------

- Cipher


代码实现
---------------------------------

{% highlight java %}
package com.freud.security;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Objects;

import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.SecretKey;
import javax.crypto.interfaces.DHPublicKey;
import javax.crypto.spec.DHParameterSpec;

public class DHTest {

	private static final String src = "林断山明竹隐墙，乱蝉衰草小池塘。";

	public static void main(String[] args) throws Exception {
		jdkDH();
	}

	public static void jdkDH() throws Exception {
		// 1. 初始化发送方密钥
		KeyPairGenerator senderKeyPairGenerator = KeyPairGenerator.getInstance("DH");
		senderKeyPairGenerator.initialize(512);
		KeyPair senderKeyPair = senderKeyPairGenerator.generateKeyPair();
		byte[] senderPublicKeyEnc = senderKeyPair.getPublic().getEncoded(); // 发送方公钥,通过其他途径发送给接收方(网络等。)

		// 2. 初始化接收方密钥
		KeyFactory receiverKeyFactory = KeyFactory.getInstance("DH");
		X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(senderPublicKeyEnc);
		PublicKey receiverPublicKey = receiverKeyFactory.generatePublic(x509EncodedKeySpec);
		DHParameterSpec dhParameterSpec = ((DHPublicKey) receiverPublicKey).getParams();
		KeyPairGenerator receiverKeyPairGenerator = KeyPairGenerator.getInstance("DH");
		receiverKeyPairGenerator.initialize(dhParameterSpec);
		KeyPair receiverKeyPair = receiverKeyPairGenerator.generateKeyPair();
		PrivateKey receivePrimaryKey = receiverKeyPair.getPrivate();
		byte[] receivePublicKeyEnc = receiverKeyPair.getPublic().getEncoded();

		// 3. 密钥构建
		KeyAgreement receiverKeyAgreement = KeyAgreement.getInstance("DH");
		receiverKeyAgreement.init(receivePrimaryKey);
		receiverKeyAgreement.doPhase(receiverPublicKey, true);
		SecretKey receiverDesKey = receiverKeyAgreement.generateSecret("DES");

		KeyFactory senderKeyFactory = KeyFactory.getInstance("DH");
		x509EncodedKeySpec = new X509EncodedKeySpec(receivePublicKeyEnc);
		PublicKey senderPublicKey = senderKeyFactory.generatePublic(x509EncodedKeySpec);
		KeyAgreement senderKeyAgreement = KeyAgreement.getInstance("DH");
		senderKeyAgreement.init(senderKeyPair.getPrivate());
		senderKeyAgreement.doPhase(senderPublicKey, true);
		SecretKey senderDesKey = senderKeyAgreement.generateSecret("DES");

		if (Objects.equals(receiverDesKey, senderDesKey)) {
			System.out.println("双方密钥相同");
		}

		// 4. 加密
		Cipher cipher = Cipher.getInstance("DES");
		cipher.init(Cipher.ENCRYPT_MODE, senderDesKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("JDK DH encrypt:" + Base64.getEncoder().encodeToString(result));

		// 5. 解密
		cipher.init(Cipher.DECRYPT_MODE, receiverDesKey);
		result = cipher.doFinal(result);
		System.out.println("JDK DH decrypt:" + new String(result));
	}
}
{% endhighlight %}


![/images/blog/encryption/06-asymmetric-encryption/01-init-DH.png](/images/blog/encryption/06-asymmetric-encryption/01-init-DH.png)

![/images/blog/encryption/06-asymmetric-encryption/02-DH.png](/images/blog/encryption/06-asymmetric-encryption/02-DH.png)


RSA
=================================

+ 数据加密&数字签名
+ 公钥加密，私钥解密
+ 私钥加密，公钥解密

{% highlight java %}
package com.freud.security;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import javax.crypto.Cipher;

import org.apache.commons.codec.binary.Base64;

public class RSATest {

	private static final String src = "但使龙城飞将在，不教胡马度阴山。";

	public static void main(String[] args) throws Exception {

		// 1.初始化密钥
		KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
		keyPairGenerator.initialize(512);
		KeyPair keyPair = keyPairGenerator.generateKeyPair();
		RSAPublicKey rsaPublicKey = (RSAPublicKey) keyPair.getPublic();
		RSAPrivateKey rsaPrivateKey = (RSAPrivateKey) keyPair.getPrivate();

		System.out.println("public key:" + Base64.encodeBase64String(rsaPublicKey.getEncoded()));
		System.out.println("private key:" + Base64.encodeBase64String(rsaPrivateKey.getEncoded()));

		// 2.私钥加密，公钥解密-加密
		PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(rsaPrivateKey.getEncoded());
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		PrivateKey privateKey = keyFactory.generatePrivate(pkcs8EncodedKeySpec);
		Cipher cipher = Cipher.getInstance("RSA");
		cipher.init(Cipher.ENCRYPT_MODE, privateKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("私钥加密，公钥解密-加密：" + Base64.encodeBase64String(result));

		// 3.私钥加密，公钥解密-解密
		X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(rsaPublicKey.getEncoded());
		keyFactory = KeyFactory.getInstance("RSA");
		PublicKey publicKey = keyFactory.generatePublic(x509EncodedKeySpec);
		cipher = Cipher.getInstance("RSA");
		cipher.init(Cipher.DECRYPT_MODE, publicKey);
		result = cipher.doFinal(result);
		System.out.println("私钥加密，公钥解密-解密:" + new String(result));

		// 4.公钥加密，私钥解密-加密
		x509EncodedKeySpec = new X509EncodedKeySpec(rsaPublicKey.getEncoded());
		keyFactory = KeyFactory.getInstance("RSA");
		publicKey = keyFactory.generatePublic(x509EncodedKeySpec);
		cipher = Cipher.getInstance("RSA");
		cipher.init(Cipher.ENCRYPT_MODE, publicKey);
		result = cipher.doFinal(src.getBytes());
		System.out.println("公钥加密，私钥解密-加密：" + Base64.encodeBase64String(result));

		// 5.公钥加密，私钥解密-解密
		pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(rsaPrivateKey.getEncoded());
		keyFactory = KeyFactory.getInstance("RSA");
		privateKey = keyFactory.generatePrivate(pkcs8EncodedKeySpec);
		cipher = Cipher.getInstance("RSA");
		cipher.init(Cipher.DECRYPT_MODE, privateKey);
		result = cipher.doFinal(result);
		System.out.println("公钥加密，私钥解密-解密：" + new String(result));
	}
}
{% endhighlight %}

![/images/blog/encryption/06-asymmetric-encryption/03-rsa-privatekey-to-publickey.png](/images/blog/encryption/06-asymmetric-encryption/03-rsa-privatekey-to-publickey.png)

![/images/blog/encryption/06-asymmetric-encryption/04-rsa-publickey-to-privatekey.png](/images/blog/encryption/06-asymmetric-encryption/04-rsa-publickey-to-privatekey.png)


ElGamal
=================================

+ 只提供公钥加密算法
+ BouncyCastle

{% highlight java %}
package com.freud.security;

import java.security.AlgorithmParameterGenerator;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import javax.crypto.Cipher;
import javax.crypto.spec.DHParameterSpec;

import org.apache.commons.codec.binary.Base64;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

public class EIGamalTest {

	private static final String src = "将有必死之心，士无贪生之念！";

	public static void main(String[] args) throws Exception {

		Security.addProvider(new BouncyCastleProvider());

		// 1.初始化密钥
		AlgorithmParameterGenerator algorithmParameterGenerator = AlgorithmParameterGenerator.getInstance("ElGamal");
		algorithmParameterGenerator.init(256);
		AlgorithmParameters algorithmParameters = algorithmParameterGenerator.generateParameters();
		DHParameterSpec dhParameterSpec = algorithmParameters.getParameterSpec(DHParameterSpec.class);
		KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("ElGamal");
		keyPairGenerator.initialize(dhParameterSpec, new SecureRandom());
		KeyPair keyPair = keyPairGenerator.generateKeyPair();
		PublicKey rsaPublicKey = keyPair.getPublic();
		PrivateKey rsaPrivateKey = keyPair.getPrivate();

		System.out.println("public key:" + Base64.encodeBase64String(rsaPublicKey.getEncoded()));
		System.out.println("private key:" + Base64.encodeBase64String(rsaPrivateKey.getEncoded()));

		// 1.公钥加密，私钥解密-加密
		X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(rsaPublicKey.getEncoded());
		KeyFactory keyFactory = KeyFactory.getInstance("ElGamal");
		PublicKey publicKey = keyFactory.generatePublic(x509EncodedKeySpec);
		Cipher cipher = Cipher.getInstance("ElGamal");
		cipher.init(Cipher.ENCRYPT_MODE, publicKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("公钥加密，私钥解密-加密：" + Base64.encodeBase64String(result));

		// 2.公钥加密，私钥解密-解密
		PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(rsaPrivateKey.getEncoded());
		keyFactory = KeyFactory.getInstance("ElGamal");
		PrivateKey privateKey = keyFactory.generatePrivate(pkcs8EncodedKeySpec);
		cipher = Cipher.getInstance("ElGamal");
		cipher.init(Cipher.DECRYPT_MODE, privateKey);
		result = cipher.doFinal(result);
		System.out.println("公钥加密，私钥解密-解密：" + new String(result));
	}
}
{% endhighlight %}

![/images/blog/encryption/06-asymmetric-encryption/05-ElGamal.png](/images/blog/encryption/06-asymmetric-encryption/05-ElGamal.png)


参考资料
===========================

[JAVA实现非对称加密](https://www.imooc.com/video/6278)

