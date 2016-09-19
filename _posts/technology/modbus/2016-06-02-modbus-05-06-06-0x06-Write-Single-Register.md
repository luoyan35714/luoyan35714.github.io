---
layout: post
title:  Modbus-学习笔记(十)-0x06 Write Single Register(写单保持寄存器)
date:   2016-06-20 23:44:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}



模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-06-Write-Single-Register/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-06-Write-Single-Register/07-modbus-slave-setup-definition.png)

Display -> Signed
-----------------------------

![Display-Signed](/images/blog/modbus/modbus-05-06-Write-Single-Register/08-modbus-slave-data-type-setup.png)


代码实现
=============================

Test0X06.java
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
public class Test0X06 {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			String request = "000100000006010600010064";
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
 * Request  : 000100000006010600010064
 * response : 000100000006010600010064
 */
{% endhighlight %}

Request解析
-----------------------------

`000100000006010600010064`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 输出地址(2) | 值(2) |
| 0001        | 0000        | 0006    | 01          | 06        | 0001        | 0064  |


其中输出地址取值为`0x0000`到`0xFFFF`,值可以是`0x0000`到`0xFFFF`。

Response解析
-----------------------------

返回字节数组解析为16进制为`000100000006010600010064`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 线圈地址(2) | 值(2) |
| 0001        | 0000        | 0007    | 01          | 06        | 0001        | 0064  |


模拟器Server控制结果
=============================

![Request](/images/blog/modbus/modbus-05-06-Write-Single-Register/09-modbus-slave-control-result.png)


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-06-Write-Single-Register/01_Request.png)

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-06-Write-Single-Register/02_Response.png)

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-06-Write-Single-Register/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-06-Write-Single-Register/04_Example.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-06-Write-Single-Register/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》

Modbus RTU和ASCII 协议解析 : [http://www.modbustools.com/modbus.html](http://www.modbustools.com/modbus.html)
