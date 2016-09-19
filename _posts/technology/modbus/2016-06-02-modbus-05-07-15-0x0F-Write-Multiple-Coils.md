---
layout: post
title:  Modbus-学习笔记(十一)-0x0F Write Multiple Coils(写多线圈寄存器)
date:   2016-06-20 23:45:30 +0800
category : 技术文档
tag : Modbus
---

* content
{:toc}


模拟器Server设置
=============================

Connection -> Connect
-----------------------------

![connect-setup](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/06-modbus-slave-connect-setup.png)

Setup -> Slave Definition
-----------------------------

![setup-definition](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/07-modbus-slave-setup-definition.png)


代码实现
=============================

Test0X0F.java
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
public class Test0X0F {

	public static void main(String[] args) throws Exception {

		Socket socket = null;

		OutputStream os = null;
		InputStream is = null;

		try {
			socket = new Socket("localhost", 502);
			os = socket.getOutputStream();
			is = socket.getInputStream();
			String request = "000100000009010F0000000A025503";
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
 * Request  : 000100000009010F0000000A025503
 * response : 000100000006010F0000000A
 */
{% endhighlight %}

Request解析
-----------------------------

`000100000009010F0000000A025503`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 开始地址(2) | Quantity of Outputs(2) | 字节个数(1) | 输出值(2) |
| 0001        | 0000        | 0009    | 01          | 0F        | 0000        | 000A                   | 02          | 5503      |


其中输出值`5503`转换为2进制为`0101010100000011`,代表的意思为

| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 | 15 | 14 | 13 | 12 | 11 | 10 | 9 | 8 |
| 0 | 1 | 0 | 1 | 0 | 1 | 0 | 1 | 0  | 0  | 0  | 0  | 0  | 0  | 1 | 1 |

Response解析
-----------------------------

返回字节数组解析为16进制为`000100000006010F0000000A`

| 传输标志(2) | 协议标志(2) | 长度(2) | 单元标志(1) | 功能码(1) | 开始地址(2) | Quantity of Outputs(2) |
| 0001        | 0000        | 0006    | 01          | 0F        | 0000        | 000A                   |


模拟器Server控制结果
=============================

![Request](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/08-modbus-slave-control-result.png)


官方文档
=============================

Request
-----------------------------

![Request](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/01_Request.png)

> *N = Quantity of Outputs / 8, if the remainder is different of 0  N = N+1

Response
-----------------------------

![Response](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/02_Response.png)

Error
-----------------------------

![Error](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/03_Error.png)

Example
-----------------------------

![Example](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/04_Example.png)

State Diagram
-----------------------------

![State Diagram](/images/blog/modbus/modbus-05-15-Write-Multiple-Coils/05_State_Diagram.png)


<br>
<br>

参考资料
================================

Modbus官方文档:《Modbus_Application_Protocol_V1_1b3》

Modbus RTU和ASCII 协议解析 : [http://www.modbustools.com/modbus.html](http://www.modbustools.com/modbus.html)
