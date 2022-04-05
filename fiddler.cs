/* 
# No mom, my code is not this bad, im just lazy to make it efficient #
*/
import System;
import System.Windows.Forms;
import Fiddler;
import System.Text.RegularExpressions;

var list = ["https://api-os-takumi.mihoyo.com",
    "https://hk4e-api-os-static.mihoyo.com",
    "https://hk4e-sdk-os.mihoyo.com",
    "https://dispatchosglobal.yuanshen.com",
    "https://osusadispatch.yuanshen.com",
    "https://account.mihoyo.com",
    "https://log-upload-os.mihoyo.com",
    "https://dispatchcntest.yuanshen.com",
    "https://devlog-upload.mihoyo.com",
    "https://webstatic.mihoyo.com",
    "https://log-upload.mihoyo.com",
    "https://hk4e-sdk.mihoyo.com",
    "https://api-beta-sdk.mihoyo.com",
    "https://api-beta-sdk-os.mihoyo.com",
    "https://cnbeta01dispatch.yuanshen.com",
    "https://dispatchcnglobal.yuanshen.com",
    "https://cnbeta02dispatch.yuanshen.com",
    "https://sdk-os-static.mihoyo.com",
    "https://webstatic-sea.mihoyo.com",
    ];

class Handlers
{
    static function OnBeforeRequest(oS: Session) {
        var active = 10 // Debugging
        if(active){
            if(oS.uriContains("http://overseauspider.yuanshen.com:8888/log")){
                oS.oRequest.FailSession(404, "Blocked", "yourmom"); // How funny
            }
            
            for(var i = 0;i<20;i++) {
                if(oS.uriContains(list[i])) {
                    oS.fullUrl = oS.fullUrl.Replace("https://", "http://");
                    oS.host = "localhost";
                    break;
                }
            }
        }

    }
                                
};
