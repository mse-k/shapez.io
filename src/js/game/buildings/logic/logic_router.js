import { globalConfig } from "../../../core/config";
import { enumDirection, Vector } from "../../../core/vector";
import { ItemAcceptorComponent, enumItemAcceptorItemFilter } from "../../components/item_acceptor";
import { ItemEjectorComponent } from "../../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../../components/item_processor";
import { Entity } from "../../entity";
import { MetaBuilding } from "../../meta_building";
import { GameRoot } from "../../root";
import { enumHubGoalRewards } from "../../tutorial_goals";
import { formatItemsPerSecond } from "../../../core/utils";
import { T } from "../../../translations";

export class MetaRouterLogicBuilding extends MetaBuilding {
    constructor() {
        super("stacker");
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        entity.addComponent(
            new ItemProcessorComponent({
                inputsPerCharge: 2,
                processorType: enumItemProcessorTypes.stacker,
            })
        );

        entity.addComponent(
            new ItemEjectorComponent({
                slots: [{ pos: new Vector(0, 0), direction: enumDirection.top }],
            })
        );
        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                    {
                        pos: new Vector(1, 0),
                        directions: [enumDirection.bottom],
                        filter: enumItemAcceptorItemFilter.shape,
                    },
                ],
            })
        );
    }
}
