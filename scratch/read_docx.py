import zipfile
import xml.etree.ElementTree as ET
import sys

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # namespaces
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            # We want to traverse paragraphs
            # w:p represents a paragraph
            for para in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                p_text = []
                for run in para.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    if run.text:
                        p_text.append(run.text)
                paragraphs.append("".join(p_text))
            
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Provide file path")
    else:
        print(get_docx_text(sys.argv[1]))
