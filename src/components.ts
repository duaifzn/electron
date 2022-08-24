import { writeFileSync } from "fs";
import { FileName } from "./dto/fileName";
import { getSetting } from "./util/getSetting";
const PORTABLE_EXECUTABLE_DIR = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR + '\\' : '';

export function listComponent(text: string): HTMLElement {
    let list = document.createElement("li") as HTMLElement;
    let btn = document.createElement("span") as HTMLElement;
    list.setAttribute("class", "list-group-item d-flex justify-content-between align-items-center");
    list.innerText = text
    btn.setAttribute("class", "badge text-danger")
    btn.innerText = "刪除"
    btn.addEventListener('click', () => {
        let setting = getSetting();
        let autoSignPath = setting.autoSignPath.filter(p => p !== text);
        writeFileSync(`${PORTABLE_EXECUTABLE_DIR}${FileName.settingJson}`, JSON.stringify({ ...setting, autoSignPath: autoSignPath }))
        list.remove();
    })
    list.append(btn);
    return list
}