import { BaseHUDPart } from "../base_hud_part";
import { DrawParameters } from "../../../core/draw_parameters";
import { makeDiv } from "../../../core/utils";
import { THIRDPARTY_URLS } from "../../../core/config";

export class HUDWatermark extends BaseHUDPart {
    createElements(parent) {
        this.element = makeDiv(parent, "ingame_HUD_Watermark");
    }

    initialize() {
        this.trackClicks(this.element, this.onWatermarkClick);
    }

    onWatermarkClick() {
        this.root.app.analytics.trackUiClick("watermark_click");
        this.root.app.platformWrapper.openExternalLink(THIRDPARTY_URLS.standaloneStorePage);
    }

    /**
     *
     * @param {DrawParameters} parameters
     */
    drawOverlays(parameters) {
        const w = this.root.gameWidth;
        const x = 280 * this.root.app.getEffectiveUiScale();

        parameters.context.fillStyle = "#f77";
        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 17 + "px GameFont";
        // parameters.context.textAlign = "center";
        parameters.context.fillText("DEMO VERSION", x, this.root.app.getEffectiveUiScale() * 27);

        parameters.context.font = "bold " + this.root.app.getEffectiveUiScale() * 12 + "px GameFont";
        // parameters.context.textAlign = "center";
        parameters.context.fillText(
            "Please consider to buy the full version!",
            x,
            this.root.app.getEffectiveUiScale() * 45
        );

        // parameters.context.textAlign = "left";
    }
}
