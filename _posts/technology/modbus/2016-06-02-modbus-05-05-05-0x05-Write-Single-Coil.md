---
layout: post
title:  Modbus-学习笔记(九)-0x05 Write Single Coil(写单线圈寄存器)
date:   2016-06-20 23:43:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}

模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-04-Read-Input-Registers/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-04-Read-Input-Registers/07-modbus-slave-setup-definition.png)

代码实现
=============================

Test0X05.java
-----------------------------

{% highlight java %}
package com.freud;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;

/**
 * 
 * @author Freud Kang
 *
 */
public class Test0X05 {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			byte[] request = new byte[] { 0X00, 0X01, 0X00, 0X00, 0X00, 0X06, 0X01, 0X05, 0X00,
					0X00, (byte) 0XFF, 0X00 };
			System.out.println("Request  : " + bytes2HexString(request));
			os.write(request);
			Thread.sleep(100);
			byte[] buffer = new byte[is.available()];
			is.read(buffer);
			String result = bytes2HexString(buffer);
			System.out.println("response : " + result);
		} finally {
			if (is != null) {
				is.close();
			}
			if (os != null) {
				os.flush();
				os.close();
			}
			if (socket != null) {
				socket.close();
			}
		}
	}

	public static String bytes2HexString(byte[] src) {
		StringBuilder stringBuilder = new StringBuilder();
		if (src == null || src.length <= 0) {
			return null;
		}
		for (int i = 0; i < src.length; i++) {
			int v = src[i] & 0xFF;
			String hv = Integer.toHexString(v).toUpperCase();
			if (hv.length() < 2) {
				stringBuilder.append(0);
			}
			stringBuilder.append(hv);
		}
		return stringBuilder.toString();
	}
}

/**
 * Request  : 00010000000601050000FF00
 * response : 00010000000601050000FF00
 */
{% endhighlight %}

Request解析
-----------------------------

`0X00, 0X01, 0X00, 0X00, 0X00, 0X06, 0X01, 0X05, 0X00, 0X00, 0XFF, 0X00`解析为16进制为`00010000000601050000FF00`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 输出地址(2) | 值(2) |
| 0001        | 0000        | 0006    | 01          | 05        | 0000        | FF00  |


其中输出地址取值为`0x0000`到`0xFFFF`,值可以是`0x0000`或`0xFF00`代表`0`或`1`。

Response解析
-----------------------------

返回字节数组解析为16进制为`00010000000601050000FF00`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 线圈地址(1) | 值(2) |
| 0001        | 0000        | 0007    | 01          | 05        | 0000        | FF00  |


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-05-Write-Single-Coil/01_Request.png)

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-05-Write-Single-Coil/02_Response_1.png)
![Response](/images/blog/modbus/modbus-05-05-Write-Single-Coil/02_Response_2.png)

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-05-Write-Single-Coil/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-05-Write-Single-Coil/04_Example.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-05-Write-Single-Coil/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》
