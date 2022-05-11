---
layout: post
title:  "Websphere Application Server(02)--WAS DN在Windows下的安装"
date:   2020-08-18 09:31:01 +0800
category : 技术文档
tag: WebSphere Application Server
---

* content
{:toc}


## 1. 下载Installation Manager - 1
### 1.1 选择对应版本和安装包进行下载
[https://www.ibm.com/support/pages/node/609575#ibm-content](https://www.ibm.com/support/pages/node/609575#ibm-content)

![图片](/images/blog/WAS/02-was-nd-windows-install/01-download-1.png)
![图片](/images/blog/WAS/02-was-nd-windows-install/02-download-2.png)
![图片](/images/blog/WAS/02-was-nd-windows-install/03-download-3.png)

### 1.2 下载前需要登陆IBM ID

![图片](/images/blog/WAS/02-was-nd-windows-install/04-login.png)
![图片](/images/blog/WAS/02-was-nd-windows-install/05-download-director.png)

### 1.3 下载并安装IBM Download Director

![图片](/images/blog/WAS/02-was-nd-windows-install/06-install-download-director-01.png)
![图片](/images/blog/WAS/02-was-nd-windows-install/07-install-download-director-02.png)
![图片](/images/blog/WAS/02-was-nd-windows-install/08-install-download-director-03.png)
![图片](/images/blog/WAS/02-was-nd-windows-install/09-install-download-director-04.png)

### 1.4 刷新页面，正式使用IBM Download Director进行下载

![图片](/images/blog/WAS/02-was-nd-windows-install/10-download-director-install.png)

![图片](/images/blog/WAS/02-was-nd-windows-install/11-download-director-confirm.png)

![图片](/images/blog/WAS/02-was-nd-windows-install/12-download-director-progress.png)

## 2. 安装Installation Manager
### 2.1 找到对应的安装目录

![图片](/images/blog/WAS/02-was-nd-windows-install/13-installation-manager-directory.png)

### 2.2 选择安装包

![图片](/images/blog/WAS/02-was-nd-windows-install/14-installation-manager-install-package.png)

### 2.3 接受协议条款

![图片](/images/blog/WAS/02-was-nd-windows-install/15-installation-manager-agree-terms.png)

### 2.3 选择安装目录
![图片](/images/blog/WAS/02-was-nd-windows-install/16-installation-manager-install-directory.png)

### 2.4 安装

![图片](/images/blog/WAS/02-was-nd-windows-install/17-installation-manager-install.png)

## 3. 下载WAS 8.5

> 链接：https://pan.baidu.com/s/1sD52FvhNPIqhlVHzKTAHXw 提取码：svnu

![图片](/images/blog/WAS/02-was-nd-windows-install/18-download-WAS.png)

备注:

[https://www.ibm.com/support/pages/node/628011](https://www.ibm.com/support/pages/node/628011)

[https://www.ibm.com/cn-zh/marketplace/java-ee-runtime?mhsrc=ibmsearch_dd&mhq=WebSphere%20Application%20Server%20traditional](https://www.ibm.com/cn-zh/marketplace/java-ee-runtime?mhsrc=ibmsearch_dd&mhq=WebSphere%20Application%20Server%20traditional)

[https://www.ibm.com/support/knowledgecenter/en/SSEQTP_8.5.5/com.ibm.websphere.installation.base.doc/ae/cins_repositories.html](https://www.ibm.com/support/knowledgecenter/en/SSEQTP_8.5.5/com.ibm.websphere.installation.base.doc/ae/cins_repositories.html)

## 4. 解压
将三个zip文件解压到同一个目录下

![图片](/images/blog/WAS/02-was-nd-windows-install/19-unzip-WAS.png)

## 5. 配置Installation Manager
`文件` -》 `首选项` -》 `存储库` -》 `添加存储库`

![图片](/images/blog/WAS/02-was-nd-windows-install/19-add-repository.png)

## 6. 安装WAS 
### 6.1 选择安装软件包

![图片](/images/blog/WAS/02-was-nd-windows-install/20-choose-install-package.png)

### 6.2 确认验证结果

![图片](/images/blog/WAS/02-was-nd-windows-install/21-check-prerequisite.png)

### 6.3 接受协议条款

![图片](/images/blog/WAS/02-was-nd-windows-install/22-agree-terms.png)

### 6.4 选择共享资源目录

![图片](/images/blog/WAS/02-was-nd-windows-install/23-share-data-directory.png)

### 6.5 选择安装目录

![图片](/images/blog/WAS/02-was-nd-windows-install/24-install-directory.png)

### 6.6 选择语言
建议只安装英语，不建议安装简体中文

![图片](/images/blog/WAS/02-was-nd-windows-install/25-language.png)

### 6.7 选择功能组件

![图片](/images/blog/WAS/02-was-nd-windows-install/26-features.png)

### 6.8 安装

![图片](/images/blog/WAS/02-was-nd-windows-install/27-install.png)

### 6.9 安装完成

![图片](/images/blog/WAS/02-was-nd-windows-install/28-install-finish.png)

## 7. 创建Profile

### 7.1 选择Profile类型
`打开WebSphere Customization Toolbox 8.5` -> `Create` -> `Application Server`

![图片](/images/blog/WAS/02-was-nd-windows-install/29-create-profile.png)

### 7.2 选择安装类型

![图片](/images/blog/WAS/02-was-nd-windows-install/30-profile-typical.png)

### 7.3 设置控制台密码

![图片](/images/blog/WAS/02-was-nd-windows-install/31-profile-credentials.png)

### 7.4 创建

![图片](/images/blog/WAS/02-was-nd-windows-install/32-profile-create.png)

### 7.5 验证Application Server

![图片](/images/blog/WAS/02-was-nd-windows-install/33-profile-verify.png)
