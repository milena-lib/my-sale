package com.pdac.caspit.emv.xml;

import android.util.Log;

import com.pdac.caspit.emv.debug.Debug;
import com.pdac.caspit.emv.debug.Type;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import java.io.StringReader;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

/**
 * Created by P.D.A.C. Technologies LTD.
 *
 * @author Alexander Kamenkov
 */

public class XmlParser {
	private static final String TAG = XmlParser.class.getSimpleName();

	public static String mapToXMLRequest(LinkedHashMap<String, String> params) {
		StringBuilder requestBuilder = new StringBuilder();

		requestBuilder.append(XmlTag.OPEN).append(XmlTag.Request.Request).append(XmlTag.CLOSE);

		Debug.log(TAG, Type.DEBUG, "XML Request is printed below");
		for (Map.Entry<String, String> entry : params.entrySet()) {
			String key = entry.getKey();
			String value = entry.getValue();
			requestBuilder.append(XmlTag.OPEN).append(key).append(XmlTag.CLOSE);
			requestBuilder.append(value);
			requestBuilder.append(XmlTag.OPEN).append(XmlTag.SLASH).append(key).append(XmlTag.CLOSE);
			Debug.log(TAG, Type.VERBOSE, key + " = [" + value + "]");
		}

		requestBuilder.append(XmlTag.OPEN).append(XmlTag.SLASH).append(XmlTag.Request.Request).append(XmlTag.CLOSE);

		Log.e(TAG, requestBuilder.toString());
		return requestBuilder.toString();
	}

	public static LinkedHashMap<String, Object> XMLResponseToMap(String responseXML) {
		LinkedHashMap<String, Object> map = new LinkedHashMap<>();
		Log.e(TAG, responseXML);

		try {
			DocumentBuilder documentBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
			InputSource inputSource = new InputSource();
			String validResponseXML = responseXML.replaceAll("[\\n|\\r]", "");
			StringReader stringReader = new StringReader(validResponseXML);
			inputSource.setCharacterStream(stringReader);

			Document document =
					documentBuilder.parse(inputSource);

			Node rootNode =
					document.getFirstChild();

			String rootNodeTagName =
					rootNode.getNodeName();

			NodeList rootNodeList =
					document.getElementsByTagName(rootNodeTagName).item(0).getChildNodes();

			Debug.log(TAG, Type.DEBUG, "XML Response is printed below");
			map = NodeListIntoMap(rootNodeList, 0);

		} catch (Exception e) {
			Debug.log(TAG, Type.ERROR, e.getMessage() + "\nresponse was:\n" + responseXML);
		}

		return map;
	}

	static LinkedHashMap<String, Object> NodeListIntoMap(NodeList nodeList, int depth) {
		int size = nodeList.getLength();
		LinkedHashMap<String, Object> map = new LinkedHashMap<>(size);

		for (int i = 0; i < size; i++) {
			Node node = nodeList.item(i);
			String key = node.getNodeName();

			if (map.containsKey(key)) {
				key += i;
			}

			Object value;
			if (node.hasChildNodes() && node.getChildNodes().item(0).hasChildNodes()) {
				Debug.log(TAG, Type.INFO, "new map created for key [" + key + "]", depth);
				Debug.log(TAG, Type.ERROR, "{", depth);
				value = NodeListIntoMap(node.getChildNodes(), depth + 1);
				Debug.log(TAG, Type.ERROR, "}", depth);
			} else {
				value = node.getTextContent();
				Debug.log(TAG, Type.VERBOSE, key + " = [" + value + "]", depth);
			}

			map.put(key, value);
		}

		return map;
	}

}
