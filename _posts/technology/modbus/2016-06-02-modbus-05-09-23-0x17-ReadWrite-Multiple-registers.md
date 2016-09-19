---
layout: post
title:  Modbus-学习笔记(十三)-0x17 ReadWrite Multiple registers(读写多个寄存器)
date:   2016-06-20 23:49:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/07-modbus-slave-setup-definition.png)

Display -> Signed
-----------------------------

![Display-Signed](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/08-modbus-slave-data-type-setup.png)


代码实现
=============================

Test0X17.java
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
public class Test0X17 {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			String request = "00010000000F0117000000020002000204001E0028";
			System.out.println("Request  : " + request);
			os.write(hexStrToBytes(request));
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

	public static byte[] hexStrToBytes(String hexStr) {
		if (hexStr.length() % 2 != 0) {
			throw new IllegalArgumentException("十六进制的字符串长度必须是2的倍数!");
		}
		byte[] ret = new byte[hexStr.length() / 2];
		for (int i = 0; i < hexStr.length(); i = i + 2) {
			ret[i / 2] = (byte) Integer.parseInt(hexStr.substring(i, i + 2), 16);
		}
		return ret;
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
 * Request  : 00010000000F0117000000020002000204001E0028
 * response : 000100000007011704000A0014
 */
{% endhighlight %}

Request解析
-----------------------------

发送字节数组解析为16进制为`00010000000F0117000000020002000204001E0028`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 读开始地址(2) | 读寄存器个数(2) | 写开始地址(2) | 写寄存器个数(2) | 写字节个数(1) | 写寄存器值(4)    |
| 0001        | 0000        | 000F    | 01          | 17        | 0000          | 0002            | 0002          | 0002            | 04            | 00 1E 00 28      |

其中写寄存器值`001E0028`转换为十进制为`30 40`

Response解析
-----------------------------

返回字节数组解析为16进制为`000100000007011704000A0014`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 字节个数(1) | 读取寄存器值(4)    |
| 0001        | 0000        | 0007    | 01          | 17        | 04          | 00 0A 00 14        |

其中读取寄存器值`000A0014`转换为十进制为`10 20`


模拟器Server控制前
=============================

![Request](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/09-modbus-slave-before-control.png)


模拟器Server控制结果
=============================

![Request](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/10-modbus-slave-control-result.png)


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/01_Request.png)

> *N = Quantity to Write

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/02_Response.png)

> *N' = Quantity to Read

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/04_Example.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-23-ReadWrite-Multiple-registers/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》

Modbus RTU和ASCII 协议解析 : [http://www.modbustools.com/modbus.html](http://www.modbustools.com/modbus.html)
