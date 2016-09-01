---
layout: post
title:  加密算法学习笔记(四) - 消息摘要算法-SHA
date:   2015-08-04 00:16:00 +0800
categories: 技术文档
tag: 加密算法
---

* content
{:toc}


SHA (Secure Hash Algrithm)
=================================

* 安全散列算法
* 固定长度摘要信息
* SHA-1(160), SHA-2(SHA-224,SHA-256,SHA-384,SHA-512)

---

{% highlight java %}
package com.freud.test.security;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Security;

import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.bouncycastle.crypto.Digest;
import org.bouncycastle.crypto.digests.SHA1Digest;
import org.bouncycastle.crypto.digests.SHA224Digest;
import org.bouncycastle.crypto.digests.SHA256Digest;
import org.bouncycastle.crypto.digests.SHA384Digest;
import org.bouncycastle.crypto.digests.SHA512Digest;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

/**
 * SHA-数据摘要算法的实现
 * 
 * @author Freud Kang
 */
public class SHATest {

	private static final String src = "少年辛苦终身事，莫向光阴惰寸功";

	public static void main(String[] args) throws Exception {
		System.out.println("明文：" + src);
		System.out.println("-------SHA-1 JDK----------");
		jdkSHA1();
		System.out.println("-------SHA-1 Bouncy Castle----------");
		bcSHA1();
		System.out.println("-------SHA-1 Commons Codec----------");
		ccSHA1();
		System.out.println("-------SHA-224 Bouncy Castle----------");
		bcSHA224_1();
		System.out
				.println("-------SHA-224 JDK_provider(Bouncy Castle)----------");
		bcSHA224_2();
		System.out.println("-------SHA-256 Bouncy Castle----------");
		bcSHA256();
		System.out.println("-------SHA-384 Bouncy Castle----------");
		bcSHA384();
		System.out.println("-------SHA-512 Bouncy Castle----------");
		bcSHA512();
	}

	/**
	 * SHA1的JDK支持
	 * 
	 * @throws NoSuchAlgorithmException
	 */
	public static void jdkSHA1() throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("SHA");
		md.update(src.getBytes());
		System.out.println("JDK SHA-1:" + Hex.encodeHexString(md.digest()));
	}

	/**
	 * SHA1的Bouncy Castle支持
	 */
	public static void bcSHA1() {
		Digest digest = new SHA1Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] sha1Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(sha1Bytes, 0);
		System.out.println("BC SHA-1:" + Hex.encodeHexString(sha1Bytes));
	}

	/**
	 * SHA1的Commons Codec支持
	 */
	public static void ccSHA1() {
		System.out.println("CC SHA1_1:" + DigestUtils.sha1Hex(src.getBytes()));
		System.out.println("CC SHA1_2:" + DigestUtils.sha1Hex(src));
	}

	/**
	 * SHA224的Bouncy Castle原生支持
	 */
	public static void bcSHA224_1() {
		Digest digest = new SHA224Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] sha224Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(sha224Bytes, 0);
		System.out.println("BC SHA-224_ORIGIN:"
				+ Hex.encodeHexString(sha224Bytes));
	}

	/**
	 * SHA224通过Bouncy Castle的JDK provider支持，
	 * 
	 * @throws NoSuchAlgorithmException
	 */
	public static void bcSHA224_2() throws NoSuchAlgorithmException {
		Security.addProvider(new BouncyCastleProvider());
		MessageDigest md = MessageDigest.getInstance("SHA224");
		byte[] sha224Bytes = md.digest(src.getBytes());
		System.out.println("BC SHA-224_JDK PROVIDER:"
				+ Hex.encodeHexString(sha224Bytes));
	}

	/**
	 * SHA256的Bouncy Castle支持
	 */
	public static void bcSHA256() {
		Digest digest = new SHA256Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] sha256Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(sha256Bytes, 0);
		System.out.println("BC SHA-256:" + Hex.encodeHexString(sha256Bytes));
	}

	/**
	 * SHA384的Bouncy Castle支持
	 */
	public static void bcSHA384() {
		Digest digest = new SHA384Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] sha384Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(sha384Bytes, 0);
		System.out.println("BC SHA-384:" + Hex.encodeHexString(sha384Bytes));
	}

	/**
	 * SHA512的Bouncy Castle支持
	 */
	public static void bcSHA512() {
		Digest digest = new SHA512Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] sha512Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(sha512Bytes, 0);
		System.out.println("BC SHA-512:" + Hex.encodeHexString(sha512Bytes));
	}
}
{% endhighlight %}

---

Maven 依赖
=================================

{% highlight xml %}
<dependencies>
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
</dependencies>
{% endhighlight %}

<br />
<br />

参考资料
===========================

[Java实现消息摘要算法加密](http://www.imooc.com/learn/286?src=sugc)

<br />
<br />