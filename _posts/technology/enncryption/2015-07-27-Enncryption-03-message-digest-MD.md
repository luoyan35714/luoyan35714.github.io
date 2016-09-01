---
layout: post
title:  加密算法学习笔记(三) - 消息摘要算法-MD
date:   2015-08-03 23:28:00 +0800
categories: 技术文档
tag: 加密算法
---

* content
{:toc}


MD (Message Digest) - 128位摘要信息
====================================

{% highlight java %}
package com.freud.test.security;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.Security;

import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.digest.DigestUtils;
import org.bouncycastle.crypto.Digest;
import org.bouncycastle.crypto.digests.MD2Digest;
import org.bouncycastle.crypto.digests.MD4Digest;
import org.bouncycastle.crypto.digests.MD5Digest;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

/**
 * 
 * MD-数据摘要算法的实现
 * 
 * @author Freud Kang
 * 
 */
public class MDTest {

	private static String src = "Never say give up!";

	public static void main(String[] args) throws Exception {
		System.out.println("明文:" + src);
		System.out.println("---------MD5--JDK------------");
		jdkMD5();
		System.out.println("---------MD5--Bouncy Castle------------");
		bcMD5();
		System.out.println("---------MD5--Commons Codec------------");
		ccMD5();
		System.out.println("---------MD2--JDK------------");
		jdkMD2();
		System.out.println("---------MD2--Bouncy Castle------------");
		bcMD2();
		System.out.println("---------MD2--Commons Codec------------");
		ccMD2();
		System.out.println("---------MD4_1--Bouncy Castle------------");
		bcMD4_1();
		System.out.println("---------MD4_2--Bouncy Castle------------");
		bcMD4_2();
	}

	/**
	 * MD5 的JDK支持
	 * 
	 * @throws NoSuchAlgorithmException
	 */
	public static void jdkMD5() throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("MD5");
		byte[] md5Bytes = md.digest(src.getBytes());
		System.out.println("JDK MD5:" + Hex.encodeHexString(md5Bytes));
	}

	/**
	 * MD5 的Bouncy Castle支持
	 */
	public static void bcMD5() {
		Digest digest = new MD5Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] md5Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(md5Bytes, 0);
		System.out.println("BC MD5:" + Hex.encodeHexString(md5Bytes));
	}

	/**
	 * MD5 的Commons Codec支持
	 */
	public static void ccMD5() {
		String md5 = DigestUtils.md5Hex(src.getBytes());
		System.out.println("CC MD5:" + md5);
	}

	/**
	 * MD2 的JDK支持
	 * 
	 * @throws NoSuchAlgorithmException
	 */
	public static void jdkMD2() throws NoSuchAlgorithmException {
		MessageDigest md = MessageDigest.getInstance("MD2");
		byte[] md5Bytes = md.digest(src.getBytes());
		System.out.println("JDK MD2:" + Hex.encodeHexString(md5Bytes));
	}

	/**
	 * MD2 的Bouncy Castle支持
	 */
	public static void bcMD2() {
		Digest digest = new MD2Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] md2Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(md2Bytes, 0);
		System.out.println("BC MD2:" + Hex.encodeHexString(md2Bytes));
	}

	/**
	 * MD2 的Commons Codec支持
	 */
	public static void ccMD2() {
		String md2 = DigestUtils.md2Hex(src.getBytes());
		System.out.println("CC MD2:" + md2);
	}

	/**
	 * MD4 的Bouncy Castle原生支持
	 * 
	 * @throws IOException
	 */
	public static void bcMD4_1() throws IOException {

		Digest digest = new MD4Digest();
		digest.update(src.getBytes(), 0, src.getBytes().length);
		byte[] md4Bytes = new byte[digest.getDigestSize()];
		digest.doFinal(md4Bytes, 0);
		System.out.println("BC MD4_2:" + Hex.encodeHexString(md4Bytes));
	}

	/**
	 * MD4 的Bouncy Castle支持加入Java的Security Provider来通过JDK API支持
	 * 
	 * @throws IOException
	 */
	public static void bcMD4_2() throws NoSuchAlgorithmException {
		Security.addProvider(new BouncyCastleProvider());
		MessageDigest md = MessageDigest.getInstance("MD4");
		byte[] md4Bytes = md.digest(src.getBytes());
		System.out.println("BC MD4_2:" + Hex.encodeHexString(md4Bytes));
	}
}
{% endhighlight %}

---

Maven 依赖
====================================

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