---
layout: post
title:  加密算法(五) - 对称加密算法
date:   2017-08-19 23:19:00 +0800
categories: 技术文档
tag: 加密算法
---

* content
{:toc}


DES(Data Encryption Standard)
=================================

![/images/blog/encryption/05-symmetric-encryption/01-DES-introduction.png](/images/blog/encryption/05-symmetric-encryption/01-DES-introduction.png)

{% highlight java %}
package com.freud.test.security;

import java.security.Security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESKeySpec;

import org.apache.commons.codec.binary.Hex;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

/**
 * DES 加解密算法
 * 
 * @author Freud
 */
public class DESTest {

	private static final String src = "苟利国家生死以，岂因祸福避趋之。";
	
	public static void main(String[] args) throws Exception{
		jdkDES();
		bcDES();
	}
	
	/**
	 * DES JDK的实现方式
	 * 
	 * @throws Exception
	 */
	public static void jdkDES() throws Exception{
		// 生成Key
		KeyGenerator keyGenerator = KeyGenerator.getInstance("DES");
		System.out.println(keyGenerator.getProvider().getName());
		keyGenerator.init(56);
		SecretKey secretKey = keyGenerator.generateKey();
		byte[] bytesKey = secretKey.getEncoded();
		
		// Key转换
		DESKeySpec desKeySpec = new DESKeySpec(bytesKey);
		SecretKeyFactory factory = SecretKeyFactory.getInstance("DES");
		SecretKey convertSecretKey = factory.generateSecret(desKeySpec);
		
		// 加密
		Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, convertSecretKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("JDK DES ENCRYPT : "+ Hex.encodeHexString(result));
		
		// 解密
		cipher.init(Cipher.DECRYPT_MODE, convertSecretKey);
		result = cipher.doFinal(result);
		System.out.println("JDK DES DECRYPT : " + new String(result));
	}
	
	/**
	 * DES BouncyCastle的实现方式
	 * 
	 * @throws Exception
	 */
	public static void bcDES() throws Exception{
		
		Security.addProvider(new BouncyCastleProvider());
		// 生成Key
		KeyGenerator keyGenerator = KeyGenerator.getInstance("DES", "BC");
		System.out.println(keyGenerator.getProvider().getName());
		keyGenerator.init(56);
		SecretKey secretKey = keyGenerator.generateKey();
		byte[] bytesKey = secretKey.getEncoded();
		
		// Key转换
		DESKeySpec desKeySpec = new DESKeySpec(bytesKey);
		SecretKeyFactory factory = SecretKeyFactory.getInstance("DES");
		SecretKey convertSecretKey = factory.generateSecret(desKeySpec);
		
		// 加密
		Cipher cipher = Cipher.getInstance("DES/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, convertSecretKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("BC DES ENCRYPT : "+ Hex.encodeHexString(result));
		
		// 解密
		cipher.init(Cipher.DECRYPT_MODE, convertSecretKey);
		result = cipher.doFinal(result);
		System.out.println("BC DES DECRYPT : " + new String(result));
	}
	
}
{% endhighlight %}

![/images/blog/encryption/05-symmetric-encryption/02-DES-FLOW.png](/images/blog/encryption/05-symmetric-encryption/02-DES-FLOW.png)


3DES(Triple DES或DESede)
=================================

![/images/blog/encryption/05-symmetric-encryption/03-3DES-introduction.png](/images/blog/encryption/05-symmetric-encryption/03-3DES-introduction.png)

{% highlight java %}
package com.freud.test.security;

import java.security.SecureRandom;
import java.security.Security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;

import org.apache.commons.codec.binary.Hex;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

/**
 * 3DES 加解密算法
 * 
 * @author Freud
 */
public class T3DESTest {

	private static final String src = "苟利国家生死以，岂因祸福避趋之。";
	
	public static void main(String[] args) throws Exception{
		jdk3DES();
		bc3DES();
	}
	
	/**
	 * 3DES JDK的实现方式
	 * 
	 * @throws Exception
	 */
	public static void jdk3DES() throws Exception{
		// 生成Key
		KeyGenerator keyGenerator = KeyGenerator.getInstance("DESede");
		System.out.println(keyGenerator.getProvider().getName());
//		keyGenerator.init(168);
		keyGenerator.init(new SecureRandom());
		SecretKey secretKey = keyGenerator.generateKey();
		byte[] bytesKey = secretKey.getEncoded();
		
		// Key转换
		DESedeKeySpec desKeySpec = new DESedeKeySpec(bytesKey);
		SecretKeyFactory factory = SecretKeyFactory.getInstance("DESede");
		SecretKey convertSecretKey = factory.generateSecret(desKeySpec);
		
		// 加密
		Cipher cipher = Cipher.getInstance("DESede/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, convertSecretKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("JDK 3DES ENCRYPT : "+ Hex.encodeHexString(result));
		
		// 解密
		cipher.init(Cipher.DECRYPT_MODE, convertSecretKey);
		result = cipher.doFinal(result);
		System.out.println("JDK 3DES DECRYPT : " + new String(result));
	}
	
	/**
	 * 3DES BouncyCastle的实现方式
	 * 
	 * @throws Exception
	 */
	public static void bc3DES() throws Exception{
		
		Security.addProvider(new BouncyCastleProvider());
		// 生成Key
		KeyGenerator keyGenerator = KeyGenerator.getInstance("DESede", "BC");
		System.out.println(keyGenerator.getProvider().getName());
		keyGenerator.init(168);
		SecretKey secretKey = keyGenerator.generateKey();
		byte[] bytesKey = secretKey.getEncoded();
		
		// Key转换
		DESedeKeySpec desKeySpec = new DESedeKeySpec(bytesKey);
		SecretKeyFactory factory = SecretKeyFactory.getInstance("DESede");
		SecretKey convertSecretKey = factory.generateSecret(desKeySpec);
		
		// 加密
		Cipher cipher = Cipher.getInstance("DESede/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, convertSecretKey);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("BC 3DES ENCRYPT : "+ Hex.encodeHexString(result));
		
		// 解密
		cipher.init(Cipher.DECRYPT_MODE, convertSecretKey);
		result = cipher.doFinal(result);
		System.out.println("BC 3DES DECRYPT : " + new String(result));
	}
}
{% endhighlight %}


AES(Advanced Encryption Standard)
=================================

![/images/blog/encryption/05-symmetric-encryption/04-AES-introduction.png](/images/blog/encryption/05-symmetric-encryption/04-AES-introduction.png)

{% highlight java %}
package com.freud.test.security;

import java.security.Key;
import java.security.Security;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

/**
 * AES 加解密算法
 * 
 * @author Freud
 */
public class AESTest {

	private static final String src = "林断山明竹隐墙，乱蝉衰草小池塘。";

	public static void main(String[] args) throws Exception {
		jdkAES();
		bcAES();
	}

	/**
	 * AES JDK的实现方式
	 * 
	 * @throws Exception
	 */
	public static void jdkAES() throws Exception {
		// 生成KEY
		KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
		System.out.println(keyGenerator.getProvider().getName());
		keyGenerator.init(128);
		SecretKey secretKey = keyGenerator.generateKey();
		byte[] keyBytes = secretKey.getEncoded();

		// KEY转换
		Key key = new SecretKeySpec(keyBytes, "AES");

		// 加密
		Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, key);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("JDK AES ENCRYPT : " + Base64.encodeBase64String(result));

		// 解密
		cipher.init(Cipher.DECRYPT_MODE, key);
		result = cipher.doFinal(result);
		System.out.println("JDK AES DECRYPT : " + new String(result));
	}

	/**
	 * AES BouncyCastle的实现方式
	 * 
	 * @throws Exception
	 */
	public static void bcAES() throws Exception {

		Security.addProvider(new BouncyCastleProvider());

		// 生成KEY
		KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
		System.out.println(keyGenerator.getProvider().getName());
		keyGenerator.init(128);
		SecretKey secretKey = keyGenerator.generateKey();
		byte[] keyBytes = secretKey.getEncoded();

		// KEY转换
		Key key = new SecretKeySpec(keyBytes, "AES");

		// 加密
		Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, key);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("BC AES ENCRYPT : " + Base64.encodeBase64String(result));

		// 解密
		cipher.init(Cipher.DECRYPT_MODE, key);
		result = cipher.doFinal(result);
		System.out.println("BC AES DECRYPT : " + new String(result));
	}
}
{% endhighlight %}

![/images/blog/encryption/05-symmetric-encryption/05-AES-FLOW.png](/images/blog/encryption/05-symmetric-encryption/05-AES-FLOW.png)


PBE(Password Based Encryption)
=================================

![/images/blog/encryption/05-symmetric-encryption/06-PBE-inroduction_1.png](/images/blog/encryption/05-symmetric-encryption/06-PBE-inroduction_1.png)

![/images/blog/encryption/05-symmetric-encryption/06-PBE-inroduction_2.png](/images/blog/encryption/05-symmetric-encryption/06-PBE-inroduction_2.png)

![/images/blog/encryption/05-symmetric-encryption/06-PBE-inroduction_3.png](/images/blog/encryption/05-symmetric-encryption/06-PBE-inroduction_3.png)

{% highlight java %}
package com.freud.test.security;

import java.security.Key;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.PBEParameterSpec;

import org.apache.commons.codec.binary.Base64;

/**
 * PBE 加解密算法
 * 
 * @author Freud
 */
public class PBETest {

	private static final String src = "林断山明竹隐墙，乱蝉衰草小池塘。";

	public static void main(String[] args) throws Exception {
		jdkPBE();
	}

	/**
	 * PBE JDK的实现方式
	 * 
	 * @throws Exception
	 */
	public static void jdkPBE() throws Exception {
		// 初始化盐
		SecureRandom random = new SecureRandom();
		byte[] salt = random.generateSeed(8);

		// 口令与密钥
		String password = "www.hifreud.com";
		PBEKeySpec pbeKeySpec = new PBEKeySpec(password.toCharArray());
		SecretKeyFactory factory = SecretKeyFactory.getInstance("PBEWITHMD5andDES");
		Key key = factory.generateSecret(pbeKeySpec);

		// 加密
		PBEParameterSpec pbeParameterSpec = new PBEParameterSpec(salt, 100);
		Cipher cipher = Cipher.getInstance("PBEWITHMD5andDES");
		cipher.init(Cipher.ENCRYPT_MODE, key, pbeParameterSpec);
		byte[] result = cipher.doFinal(src.getBytes());
		System.out.println("JDK PBE ENCRYPT : " + Base64.encodeBase64String(result));

		// 解密
		cipher.init(Cipher.DECRYPT_MODE, key, pbeParameterSpec);
		result = cipher.doFinal(result);
		System.out.println("JDK PBE DECRYPT : " + new String(result));
	}

}
{% endhighlight %}

![/images/blog/encryption/05-symmetric-encryption/07-PBE-FLOW.png](/images/blog/encryption/05-symmetric-encryption/07-PBE-FLOW.png)


Maven 依赖
=================================

{% highlight xml %}
<dependency>
	<groupId>commons-codec</groupId>
	<artifactId>commons-codec</artifactId>
	<version>1.10</version>
</dependency>
<dependency>
	<groupId>org.bouncycastle</groupId>
	<artifactId>bcprov-jdk16</artifactId>
	<version>1.46</version>
</dependency>
{% endhighlight %}


参考资料
===========================

[Java实现消息摘要算法加密](http://www.imooc.com/learn/286?src=sugc)

PBETest : [https://fossies.org/linux/envelopes-sourceonly/thirdparty/bouncycastle-135-customized/test/src/org/bouncycastle/jce/provider/test/PBETest.java](https://fossies.org/linux/envelopes-sourceonly/thirdparty/bouncycastle-135-customized/test/src/org/bouncycastle/jce/provider/test/PBETest.java)
