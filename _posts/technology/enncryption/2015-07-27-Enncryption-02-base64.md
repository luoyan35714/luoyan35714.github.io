---
layout: post
title:  加密算法学习笔记(二) - BASE64
date:   2015-07-27 23:31:00 +0800
categories: 技术文档
tag: 加密算法
---

* content
{:toc}


BASE64的三种实现方法
====================================

* JDK：由于JDK不建议使用，所以在使用Eclipse编写的时候要解开限制，方法是设置Windows->Prefrences->Java->Compiler->Errors/Warnings->Deprecated and trstricted API->Forbidden reference(access rules)->Warining,然后在project build path中移除JRE System Library，保存，再添加库JRE System Library，重新编译
* Commons Codec
* Bouncy Castle

Maven依赖
===========================

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

---

Base64Test类
===========================

{% highlight java %}
package com.freud.test.security;

import java.io.IOException;

import org.apache.commons.codec.binary.Base64;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/**
 * 
 * Base64的各种加解密过程
 * 
 * @author Freud Kang
 * 
 */
public class Base64Test {

	private static final String src = "Keep Hungry, Keep Stupid!";

	public static void main(String[] args) throws Exception {
		System.out.println("明文：" + src);
		System.out.println("-----JDK-----");
		jdkBase64();
		System.out.println("-----Commons Codec-----");
		commonsCodecBase64();
		System.out.println("-----Bouncy Castle-----");
		bouncyCastleBase64();
	}

	/**
	 * JDK Base64加解密
	 * 
	 * @throws IOException
	 */
	public static void jdkBase64() throws IOException {
		BASE64Encoder encoder = new BASE64Encoder();
		String encode = encoder.encode(src.getBytes());
		System.out.println("经过JDK的BASE64加密：" + encode);
		System.out.println("经过JDK的BASE64解密："
				+ new String(new BASE64Decoder().decodeBuffer(encode)));
	}

	/**
	 * Commons Codec Base64加解密
	 */
	public static void commonsCodecBase64() {
		byte[] encodeBytes = Base64.encodeBase64(src.getBytes());
		System.out.println("Commones codec加密结果：" + new String(encodeBytes));
		byte[] decodeBytes = Base64.decodeBase64(encodeBytes);
		System.out.println("Commones codec解密结果：" + new String(decodeBytes));
	}

	/**
	 * Bouncy Castle Base64加解密
	 */
	public static void bouncyCastleBase64() {
		byte[] encodeBytes = org.bouncycastle.util.encoders.Base64.encode(src
				.getBytes());
		System.out.println("BouncyCastle加密结果：" + new String(encodeBytes));
		byte[] decodeBytes = org.bouncycastle.util.encoders.Base64
				.decode(encodeBytes);
		System.out.println("BouncyCastle加密结果：" + new String(decodeBytes));
	}
}
{% endhighlight %}

<br />
<br />

参考资料
===========================

[慕课网-Java实现Base64加密](http://www.imooc.com/learn/285)

<br />
<br />