import Vuetify from 'vuetify'
import { createLocalVue, mount } from '@vue/test-utils'
import RackCard from '@/components/RackCard.vue'
import { EMPTY_PVS } from '@/assets/constants'
import Vuex from 'vuex'


describe('RackCard.vue', () => {
  const keys = ["Temperature", "Pressure", "Rack Open", "Humidity", "Leak"]
  const pvs = Object.assign({}, EMPTY_PVS, {Temperature: {name: "960E1:CO-SIMAR-01:Temp-Mon", value: "20 C"}, Pressure: {name: "960E1:CO-SIMAR-01:Pressure-Mon", value: "900 hPa"}});

  const default_item = { name: "Test", parent: "Test", pv_names: ["960E1:CO-SIMAR-01:Temp-Mon", "960E1:CO-SIMAR-01:Pressure-Mon"], pvs: pvs };
  const localVue = createLocalVue()
  localVue.use(Vuex);
  let vuetify
  let store

  beforeEach(() => {
    vuetify = new Vuetify()

    store = new Vuex.Store({
      state: {
        account: undefined,
        url: "ais-eng-srv-la.cnpem.br",
      },
      mutations: {
        setAccount(state, account) {
          state.account = account;
        },
      }
    })
  })

  const mountFunction = options => {
    return mount(RackCard, {
      localVue,
      vuetify,
      store,
      mocks: {
        $vuetify: { breakpoint: {} },
        item: default_item,
        filtered_keys: keys
      },
      ...options
    })
  }

  it('renders all passed keys', () => {
    const wrapper = mountFunction();

    const list = wrapper.find(".v-card").find(".v-list").findAll(".v-list-item__content");

    for (let i = 0; i < list.length; i++) {
      expect(list.at(i).text()).toMatch(keys[i] + ":");
    }
  })

  it('sets ? as value for unassigned values', () => {
    const wrapper = mountFunction();
    const list = wrapper.find(".v-card").find(".v-list").findAll("span .v-chip__content");

    for (let i = 2; i < list.length; i++) {
      expect(list.at(i).text()).toMatch("?");
    }
  })

  it('modifies PV values in real time', async () => {
    let item = default_item;
    const wrapper = mountFunction();

    expect(wrapper.find(".v-card").find(".v-list").findAll("span .v-chip__content").at(0).text()).toMatch("20 C");
    console.log(wrapper.html());

    item.pvs.Temperature.value = "22 C";
    await wrapper.setProps(item);

    expect(wrapper.find(".v-card").find(".v-list").findAll("span .v-chip__content").at(0).text()).toMatch("22 C");
  })

  it('disables configuration for unauthenticated users', () => {
    const wrapper = mountFunction();
    const button = wrapper.find(".v-card").find(".v-card__title").find(".v-dialog__container").find(".v-btn--disabled");

    expect(button.exists()).toBe(true);
  })

  it('enables configuration for authenticated users', () => {
    store.commit("setAccount", true);
    const wrapper = mountFunction();
    const button = wrapper.find(".v-card").find(".v-card__title").find(".v-dialog__container").find(".v-btn--disabled");

    expect(button.exists()).toBe(false);
  })

  it('sets chip links to valid Archiver URLs', async () => {
    let item = default_item;
    const wrapper = mountFunction();

    item.pvs.Temperature.name = "960E1:CO-SIMAR-01:Temp-Mon";

    await wrapper.setProps(item);
    const chip = wrapper.find(".v-card").find(".v-list").find(".v-chip");

    expect(chip.attributes().href).toBe("https://ais-eng-srv-la.cnpem.br/archiver-viewer/?pv=960E1:CO-SIMAR-01:Temp-Mon");
  })

  it('links to right PVs in graph shortcut', async () => {
    window.open = jest.fn();

    const wrapper = mountFunction();
    const shortcut = wrapper.find(".v-card").find(".v-card__title").find(".v-btn");
    await shortcut.trigger("click");

    expect(window.open).toHaveBeenCalledWith("https://ais-eng-srv-la.cnpem.br/archiver-viewer/?pv=960E1:CO-SIMAR-01:Temp-Mon&pv=960E1:CO-SIMAR-01:Pressure-Mon", "_blank");
  })
})
